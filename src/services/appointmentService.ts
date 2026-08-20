import type {AppointmentFilters, AppointmentRequest, AvailabilityQuery} from "../interfaces/appointmentInterface.js";
import * as appointmentInterface from "../interfaces/appointmentServiceInterface.js";
import type { AppointmentRow } from "../models/appointmentModel.js";
import * as repository from "../repositories/appointmentRepository.js";
import { createAppointmentConfirmation } from "./notificationService.js";

const toMinutes = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
const toTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00`;

const overlaps = (start: number,end: number,range: appointmentInterface.AppointmentTimeRange,): boolean =>
  start < toMinutes(range.end_time) && end > toMinutes(range.start_time);

const weekday = (date: string): string =>
  [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][new Date(`${date}T00:00:00Z`).getUTCDay()]!;

const getScheduleContext = async (query: AvailabilityQuery,excludeAppointmentId?: number,
  db?: appointmentInterface.AppointmentQueryExecutor,
): Promise<appointmentInterface.AppointmentScheduleContext> => {
  const selectedService = await repository.findActiveService(
    query.serviceId, db);

  if (!selectedService) throw new Error("Service not found or inactive.");

  if (
    !(await repository.employeeOffersService(
      query.employeeId,
      query.serviceId,
      db,
    ))
  ) {
    throw new Error("Employee is unavailable for this service.");
  }

  if (await repository.isClosedDate(query.date, db)) {
    return {
      service: selectedService,
      unavailable: true,
      workingDay: null,
      blocked: [],
    };
  }

  const workingDay = await repository.findWorkingDay(weekday(query.date), db);
  if (!workingDay || workingDay.is_closed)
    return {
      service: selectedService,
      unavailable: true,
      workingDay: null,
      blocked: [],
    };

  const [breaks, leaves, appointments] = await Promise.all([
    repository.findBusinessBreaks(query.date, db),
    repository.findApprovedEmployeeLeaves(query.employeeId, query.date, db),
    repository.findAppointmentTimeRanges(
      query.employeeId,
      query.date,
      excludeAppointmentId,
      db,
    ),
  ]);
  return {
    service: selectedService,
    unavailable: false,
    workingDay,
    blocked: [...breaks, ...leaves, ...appointments],
  };
};

export const getAvailableSlots = async (
  query: AvailabilityQuery,
): Promise<string[]> => {
  const [context, scheduling] = await Promise.all([
    getScheduleContext(query),
    repository.findSchedulingSettings(),
  ]);

  if (context.unavailable || !context.workingDay) return [];

  const opening = toMinutes(context.workingDay.opening_time);
  const closing = toMinutes(context.workingDay.closing_time);
  const duration = Number(context.service.duration_minutes);
  const buffer = Number(scheduling.appointment_buffer_minutes);
  const interval = Number(scheduling.booking_interval_minutes);
  const slots: string[] = [];

  for (
    let start = opening;
    start + duration + buffer <= closing;
    start += interval
  ) {
    if (
      !context.blocked.some((range) =>
        overlaps(start, start + duration + buffer, range),
      )
    )
      slots.push(toTime(start));
  }
  return slots;
};

const saveAppointment = async (customerId: number, input: AppointmentRequest, appointmentId?: number): Promise<AppointmentRow> => {
  const id = await repository.withTransaction(async (connection) => {
    if (appointmentId &&!(await repository.lockOwnedAppointment(
        connection,
        appointmentId,
        customerId,
      ))
    ) {
      throw new Error("Appointment not found.");
    }

    if (!(await repository.lockEmployee(connection, input.employeeId)))
      throw new Error("Employee not found or inactive.");

    const query = {date: input.appointmentDate, serviceId: input.serviceId,employeeId: input.employeeId};
    const context = await getScheduleContext(query, appointmentId, connection);
    const scheduling = await repository.findSchedulingSettings(connection);

    if (context.unavailable || !context.workingDay)
      throw new Error("The selected date is unavailable.");

    const start = toMinutes(input.startTime);
    const end = start + Number(context.service.duration_minutes);
    const bufferedEnd = end + Number(scheduling.appointment_buffer_minutes);
    const opening = toMinutes(context.workingDay.opening_time);

    if (
      start < opening ||
      (start - opening) % Number(scheduling.booking_interval_minutes) !== 0 ||
      bufferedEnd > toMinutes(context.workingDay.closing_time) ||
      context.blocked.some((range) => overlaps(start, bufferedEnd, range))
    ) {
      throw new Error("The selected appointment slot is no longer available.");
    }

    const values = {
      employeeId: input.employeeId,
      serviceId: input.serviceId,
      date: input.appointmentDate,
      startTime: toTime(start),
      endTime: toTime(end),
      amount: Number(context.service.price),
      notes: input.notes,
    };

    if (appointmentId) {
      if (
        !(await repository.updateOwned(
          connection,
          appointmentId,
          customerId,
          values,
        ))
      )
        throw new Error("Appointment not found.");
      return appointmentId;
    }
    return repository.insert(connection, { customerId, ...values });
  });

  const appointment = await repository.findById(id);
  if (!appointment) throw new Error("Failed to retrieve saved appointment.");

  return appointment;
};

export const createAppointment = async (customerId: number,input: AppointmentRequest,): Promise<AppointmentRow> => {
  const appointment = await saveAppointment(customerId, input);
  await createAppointmentConfirmation(appointment).catch((error) =>
    console.error("Failed to create appointment notification:", error),
  );
  return appointment;
};

export const updateAppointment = (id: number, customerId: number, input: AppointmentRequest) => saveAppointment(customerId, input, id);
export const getMyAppointments = (customerId: number) =>
  repository.findByCustomer(customerId);
export const getOwnedAppointment = (id: number, customerId: number) =>
  repository.findOwnedById(id, customerId);
export const deleteOwnedAppointment = (id: number, customerId: number) =>
  repository.removeOwned(id, customerId);
export const getAllAppointments = (filters: AppointmentFilters) =>
  repository.findAll(filters);

export const startAppointment = async (id: number): Promise<AppointmentRow> => {
  if (!(await repository.updateStatus(id, "Scheduled", "In Progress")))
    throw new Error("Only a scheduled appointment can be started.");

  const appointment = await repository.findById(id);
  if (!appointment) 
    throw new Error("Appointment not found.");

  return appointment;
};

export const completeAppointment = async (id: number): Promise<AppointmentRow> => {
  if (!(await repository.updateStatus(id, "In Progress", "Completed")))
    throw new Error("Only an in-progress appointment can be completed.");

  const appointment = await repository.findById(id);
  if (!appointment) 
    throw new Error("Appointment not found.");

  return appointment;
};

export const cancelOverdueAppointments = () => repository.cancelOverdue();

export const cancelAppointment = async (id: number, reason: string): Promise<AppointmentRow> => {
  if (!(await repository.cancel(id, reason)))
    throw new Error("Only a scheduled or in-progress appointment can be cancelled.");

  const appointment = await repository.findById(id);
  if (!appointment) 
    throw new Error("Appointment not found.");
  
  return appointment;
};

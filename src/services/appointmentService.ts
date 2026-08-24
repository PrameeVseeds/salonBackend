import type {AppointmentFilters, AppointmentRequest, AvailabilityQuery} from "../interfaces/appointmentInterface.js";
import * as appointmentInterface from "../interfaces/appointmentServiceInterface.js";
import type { AppointmentRow } from "../models/appointmentModel.js";
import * as repository from "../repositories/appointmentRepository.js";
import { createAppointmentCancellation, createAppointmentCompletion, createAppointmentConfirmation, createAppointmentReminder, createAppointmentStarted } from "./notificationService.js";

const toMinutes = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
const toTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00`;

const appointmentStartTime = (date: string, time: string): number =>
  new Date(`${date}T${time}`).getTime();

const isPastOrCurrentTime = (date: string, time: string): boolean =>
  appointmentStartTime(date, time) <= Date.now();

const toDateKey = (value: unknown): string => {
  if (!(value instanceof Date)) 
    return String(value).slice(0, 10);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
};

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

  if (query.employeeId !== null &&
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
      serviceAppointments: [],
      capacity: 0,
      unavailableReason: "The salon is closed on this date.",
    };
  }

  const dayOfWeek = weekday(query.date);
  const workingDay = await repository.findWorkingDay(dayOfWeek, db);
  if (!workingDay || workingDay.is_closed)
    return {
      service: selectedService,
      unavailable: true,
      workingDay: null,
      blocked: [],
      serviceAppointments: [],
      capacity: 0,
      unavailableReason: !workingDay
        ? `The salon has no working hours configured for ${dayOfWeek}.`
        : `The salon is closed on ${dayOfWeek}.`,
    };

  const [breaks, leaves, appointments, serviceAppointments, assignedEmployeeCount] = await Promise.all([
    repository.findBusinessBreaks(query.date, db),
    query.employeeId === null ? Promise.resolve([]) : 
    repository.findApprovedEmployeeLeaves(query.employeeId, query.date, db),
    query.employeeId === null ? Promise.resolve([]) : 
    repository.findAppointmentTimeRanges(query.employeeId, query.date, excludeAppointmentId, db),
    repository.findServiceAppointmentTimeRanges(query.serviceId, query.date, excludeAppointmentId, db),
    repository.countActiveEmployeesForService(query.serviceId, db),
  ]);
  const configuredCapacity = selectedService.max_concurrent_appointments;
  const staffingCapacity = assignedEmployeeCount;
  return {
    service: selectedService,
    unavailable: false,
    workingDay,
    blocked: [...breaks, ...leaves, ...appointments],
    serviceAppointments,
    capacity: Math.min(configuredCapacity ?? staffingCapacity, staffingCapacity),
    unavailableReason: null,
  };
};

export const getAvailability = async (
  query: AvailabilityQuery,
): Promise<{ slots: string[]; message: string | null }> => {
  const [context, scheduling, assignedEmployeeIds] = await Promise.all([
    getScheduleContext(query),
    repository.findSchedulingSettings(),
    query.employeeId === null
      ? repository.findActiveEmployeeIdsForService(query.serviceId)
      : Promise.resolve([query.employeeId]),
  ]);

  if (context.unavailable || !context.workingDay)
    return { slots: [], message: context.unavailableReason ?? "The salon is unavailable on this date." };

  const opening = toMinutes(context.workingDay.opening_time);
  const closing = toMinutes(context.workingDay.closing_time);
  const duration = Number(context.service.duration_minutes);
  const buffer = Number(scheduling.appointment_buffer_minutes);
  const slotStep = duration + buffer;
  const slots: string[] = [];
  const employeeContexts = assignedEmployeeIds.length
    ? await Promise.all(
        assignedEmployeeIds.map((employeeId) =>
          getScheduleContext({ ...query, employeeId }),
        ),
      )
    : [];

  for (
    let start = opening;
    start + duration + buffer <= closing;
    start += slotStep
  ) {
    if (isPastOrCurrentTime(query.date, toTime(start))) continue;
    const serviceBookings = context.serviceAppointments.filter((range) =>
      overlaps(start, start + duration + buffer, range),
    ).length;
    const salonIsAvailable = !context.blocked.some((range) =>
      overlaps(start, start + duration + buffer, range),
    );
    const professionalIsAvailable = employeeContexts.length === 0
      ? true
      : employeeContexts.some((employeeContext) =>
          !employeeContext.unavailable &&
          !employeeContext.blocked.some((range) =>
            overlaps(start, start + duration + buffer, range),
          ),
        );
    if (
      context.capacity > 0 &&
      serviceBookings < context.capacity &&
      salonIsAvailable &&
      professionalIsAvailable
    )
      slots.push(toTime(start));
  }
  return {
    slots,
    message: slots.length ? null : "All appointment times are booked for this date.",
  };
};

export const getAvailableSlots = async (query: AvailabilityQuery): Promise<string[]> =>
  (await getAvailability(query)).slots;

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

    if (!(await repository.lockService(connection, input.serviceId)))
      throw new Error("Service not found or inactive.");

    const candidates: Array<number | null> = input.employeeId ? [input.employeeId] : [null];
    const scheduling = await repository.findSchedulingSettings(connection);
    const start = toMinutes(input.startTime);
    let selectedEmployeeId: number | null = null;
    let selectedContext: appointmentInterface.AppointmentScheduleContext | null = null;

    for (const candidateId of candidates) {
      if (candidateId !== null && !(await repository.lockEmployee(connection, candidateId))) continue;
      const context = await getScheduleContext({ date: input.appointmentDate, serviceId: input.serviceId, employeeId: candidateId }, appointmentId, connection);
      if (context.unavailable || !context.workingDay) continue;
      const end = start + Number(context.service.duration_minutes);
      const bufferedEnd = end + Number(scheduling.appointment_buffer_minutes);
      const opening = toMinutes(context.workingDay.opening_time);
      const slotStep = Number(context.service.duration_minutes) + Number(scheduling.appointment_buffer_minutes);
      const unavailable = start < opening ||
        isPastOrCurrentTime(input.appointmentDate, toTime(start)) ||
        (start - opening) % slotStep !== 0 ||
        bufferedEnd > toMinutes(context.workingDay.closing_time) ||
        context.blocked.some((range) => overlaps(start, bufferedEnd, range)) ||
        context.capacity <= 0 ||
        context.serviceAppointments.filter((range) => overlaps(start, bufferedEnd, range)).length >= context.capacity;
      if (!unavailable) {
        selectedEmployeeId = candidateId;
        selectedContext = context;
        break;
      }
    }

    if (!selectedContext)
      throw new Error("The selected appointment slot is no longer available.");

    const end = start + Number(selectedContext.service.duration_minutes);

    const values = {
      employeeId: selectedEmployeeId,
      serviceId: input.serviceId,
      date: input.appointmentDate,
      startTime: toTime(start),
      endTime: toTime(end),
      amount: Number(selectedContext.service.price),
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

export const assignEmployeeToAppointment = async (id: number, employeeId: number): Promise<AppointmentRow> => {
  const appointment = await repository.findById(id);
  if (!appointment) throw new Error("Appointment not found.");
  if (appointment.status !== "Scheduled")
    throw new Error("Only a scheduled appointment can have its employee changed.");
  if (!(await repository.employeeOffersService(employeeId, appointment.service_id)))
    throw new Error("The selected employee is not active or does not offer this service.");

  const context = await getScheduleContext({
    date: toDateKey(appointment.appointment_date),
    serviceId: appointment.service_id,
    employeeId,
  }, appointment.id);
  const start = toMinutes(appointment.start_time);
  const end = toMinutes(appointment.end_time);
  if (context.unavailable || context.blocked.some((range) => overlaps(start, end, range)))
    throw new Error("The selected employee is unavailable during this appointment.");
  if (!(await repository.assignEmployee(id, employeeId)))
    throw new Error("Only a scheduled appointment can have its employee changed.");

  const updated = await repository.findById(id);
  if (!updated) throw new Error("Appointment not found.");
  return updated;
};

export const getAvailableEmployeeIdsForAppointment = async (id: number): Promise<number[]> => {
  const appointment = await repository.findById(id);
  if (!appointment) 
    throw new Error("Appointment not found.");
  
  const date = toDateKey(appointment.appointment_date);
  const start = toMinutes(appointment.start_time);
  const end = toMinutes(appointment.end_time);
  const employeeIds = await repository.findActiveEmployeeIdsForService(appointment.service_id);
  const availability = await Promise.all(employeeIds.map(async (employeeId) => {
    const context = await getScheduleContext({
      date,
      serviceId: appointment.service_id,
      employeeId,
    }, appointment.id);
    return !context.unavailable && !context.blocked.some((range) => overlaps(start, end, range))
      ? employeeId
      : null;
  }));
  return availability.filter((employeeId): employeeId is number => employeeId !== null);
};

export const startAppointment = async (id: number): Promise<AppointmentRow> => {
  if (!(await repository.startWithinScheduledWindow(id)))
    throw new Error("Only scheduled appointments within their appointment time can be started.");

  const appointment = await repository.findById(id);
  if (!appointment) 
    throw new Error("Appointment not found.");

  await createAppointmentStarted(appointment).catch((error) =>
    console.error("Failed to create appointment start notification:", error),
  );

  return appointment;
};

export const completeAppointment = async (id: number): Promise<AppointmentRow> => {
  if (!(await repository.updateStatus(id, "In Progress", "Completed")))
    throw new Error("Only an in-progress appointment can be completed.");

  const appointment = await repository.findById(id);
  if (!appointment) 
    throw new Error("Appointment not found.");

  await createAppointmentCompletion(appointment).catch((error) =>
    console.error("Failed to create appointment completion notification:", error),
  );

  return appointment;
};

export const processTimedAppointmentStatuses = async (): Promise<void> => {
  const dueReminders = await repository.findDueReminders();
  for (const appointment of dueReminders) {
    await createAppointmentReminder(appointment).catch((error) =>
      console.error(`Failed to send reminder for appointment ${appointment.id}:`, error),
    );
  }

  const overdue = await repository.findOverdueScheduled();
  for (const appointment of overdue) {
    if (await repository.cancelScheduledAsOverdue(appointment.id)) {
      const cancelled = await repository.findById(appointment.id);
      if (cancelled) await createAppointmentCancellation(cancelled).catch((error) =>
        console.error(`Failed to notify cancellation for appointment ${appointment.id}:`, error),
      );
    }
  }

  const dueForCompletion = await repository.findDueInProgress();
  for (const appointment of dueForCompletion) {
    if (await repository.updateStatus(appointment.id, "In Progress", "Completed")) {
      const completed = await repository.findById(appointment.id);
      if (completed) await createAppointmentCompletion(completed).catch((error) =>
        console.error(`Failed to notify completion for appointment ${appointment.id}:`, error),
      );
    }
  }
};

export const cancelOverdueAppointments = processTimedAppointmentStatuses;

export const cancelAppointment = async (id: number, reason: string): Promise<AppointmentRow> => {
  if (!(await repository.cancel(id, reason)))
    throw new Error("Only a scheduled or in-progress appointment can be cancelled.");

  const appointment = await repository.findById(id);
  if (!appointment) 
    throw new Error("Appointment not found.");
  
  return appointment;
};

export const cancelCustomerAppointment = async (id: number, customerId: number, reason: string): Promise<AppointmentRow> => {
  if (!(await repository.cancelOwned(id, customerId, reason)))
    throw new Error("Only your scheduled appointments can be cancelled.");
  const appointment = await repository.findOwnedById(id, customerId);
  if (!appointment) throw new Error("Appointment not found.");
  return appointment;
};

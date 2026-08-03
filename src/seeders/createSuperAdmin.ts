import bcrypt from "bcryptjs";

async function generateHash() {
  const password = "Admin@123";

  const passwordHash = await bcrypt.hash(password, 10);

  console.log("--------------------------------");
  console.log("Email    : superadmin@salon.com");
  console.log("Password : Admin@123");
  console.log("Hash:");
  console.log(passwordHash);
  console.log("--------------------------------");
}

generateHash();
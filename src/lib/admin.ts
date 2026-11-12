export const ADMIN_EMAILS = [
  "isidoreagonan@gmail.com",
  "agonandolapo@gmail.com",
  "dolapoecomllc@gmail.com",
  "dolapoecom1@gmail.com",
  "dolapoagonan@gmail.com",
];

export const isAdminUser = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

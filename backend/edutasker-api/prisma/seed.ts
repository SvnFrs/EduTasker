import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialRoles = [
  { name: 'Admin', code: 'ADMIN' },
  { name: 'Manager', code: 'MANAGER' },
  { name: 'Mentor', code: 'MENTOR' },
  { name: 'Student', code: 'STUDENT' },
];

const seed = async () => {
  await prisma.role.deleteMany();
  initialRoles.forEach(async (role) => {
    await prisma.role.create({ data: role });
  });
};

seed();

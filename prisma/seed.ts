import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSpecialities() {
  async function createMedicalSpeciality(name: string) {
    return prisma.medicalSpeciality.create({
      data: {
        name,
      },
    });
  }
  const specialities = [
    'Allergology',
    'Anaesthesiology',
    'Cardiology',
    'Dermatology',
    'Emergency medicine',
    'Endocrinology',
    'Gastroenterology',
    'General practice',
    'Geriatrics',
    'Hematology',
    'Infectious diseases',
    'Neurology',
    'Nephrology',
    'Oncology',
    'Ophthalmology',
    'Pediatrics',
    'Psychiatry',
    'Rheumatology',
    'Urology',
  ];

  for await (const speciality of specialities) {
    await createMedicalSpeciality(speciality);
  }
}

async function seedDummyUsers() {
  async function* generateUsers() {
    const people = [
      {
        email: 'natalia@cooley.com',
        firstName: 'Natalia',
        lastName: 'Cooley',
        dateOfBirth: '1990-06-11',
        sex: 'FEMALE',
        pesel: '90061112345',
      },
      {
        email: 'william@mcmahon.com',
        firstName: 'William',
        lastName: 'Mcmahon',
        dateOfBirth: '1986-02-08',
        sex: 'MALE',
        pesel: '86020812345',
      },
      {
        email: 'princess@davenport.com',
        firstName: 'Princess',
        lastName: 'Davenport',
        dateOfBirth: '1996-05-03',
        sex: 'FEMALE',
        pesel: '96050312345',
      },
      {
        email: 'kash@greer.com',
        firstName: 'Kash',
        lastName: 'Greer',
        dateOfBirth: '1992-01-12',
        sex: 'MALE',
        pesel: '92011212345',
      },
      {
        email: 'bailey@moss.com',
        firstName: 'Bailey',
        lastName: 'Moss',
        dateOfBirth: '1989-04-08',
        sex: 'FEMALE',
        pesel: '89040812345',
      },
      {
        email: 'princessa@davenport.com',
        firstName: 'Princessa',
        lastName: 'Davenport',
        dateOfBirth: '1996-05-13',
        sex: 'FEMALE',
        pesel: '96051312345',
      },
      {
        email: 'mohammed@patterson.com',
        firstName: 'Mohammed',
        lastName: 'Patterson',
        dateOfBirth: '1994-06-23',
        sex: 'MALE',
        pesel: '94062312345',
      },
      {
        email: 'elliana@jones.com',
        firstName: 'Elliana',
        lastName: 'Jones',
        dateOfBirth: '1992-11-02',
        sex: 'FEMALE',
        pesel: '92110212345',
      },
      {
        email: 'rafael@faulkner.com',
        firstName: 'Rafael',
        lastName: 'Faulkner',
        dateOfBirth: '1991-12-15',
        sex: 'MALE',
        pesel: '91121512345',
      },
      {
        email: 'zain@newton.com',
        firstName: 'Zain',
        lastName: 'Newton',
        dateOfBirth: '1978-04-25',
        sex: 'MALE',
        pesel: '78042512345',
      },
      {
        email: 'jakayla@brown.com',
        firstName: 'Jakayla',
        lastName: 'Brown',
        dateOfBirth: '1988-03-16',
        sex: 'FEMALE',
        pesel: '88031612345',
      },
      {
        email: 'brycen@williams.com',
        firstName: 'Brycen',
        lastName: 'Williams',
        dateOfBirth: '1991-07-07',
        sex: 'MALE',
        pesel: '91070712345',
      },
      {
        email: 'desirae@bush.com',
        firstName: 'Desirae',
        lastName: 'Bush',
        dateOfBirth: '1993-08-17',
        sex: 'FEMALE',
        pesel: '93081712345',
      },
    ];

    for (const person of people) {
      yield {
        email: person.email,
        firstName: person.firstName,
        lastName: person.lastName,
        dateOfBirth: new Date(person.dateOfBirth),
        password:
          '$2b$10$mg7KG9fSZaHbOU0EZzSYk.I20qiYB/AAbSOtb37kODVTXWQVLEmCm',
        sex: person.sex,
        pesel: person.pesel,
      };
    }
  }

  async function createDoctor(user: any) {
    const medicalSpecialities = await prisma.medicalSpeciality.findMany();
    const medicalSpeciality =
      medicalSpecialities[
        Math.floor(Math.random() * medicalSpecialities.length)
      ];
    const doctor = await prisma.doctor.create({
      data: {
        user: {
          connect: { id: user.id },
        },
        medicalSpecializations: {
          connect: { id: medicalSpeciality.id },
        },
      },
    });

    await prisma.medicalSpeciality.update({
      where: { id: medicalSpeciality.id },
      data: {
        doctors: {
          connect: { id: doctor.id },
        },
      },
    });
  }

  async function createPatient(user: any, pesel: string) {
    const patient = await prisma.patient.create({
      data: {
        user: {
          connect: { id: user.id },
        },
      },
    });

    await prisma.medicalData.create({
      data: {
        height: 180,
        weight: 80,
        medicalConditions: 'healthy',
        medications: 'none',
        allergies: 'none',
        addictions: 'none',
        pesel,
        bloodType: 'A+',
        patient: {
          connect: { id: patient.id },
        },
      },
    });
  }

  let usersCount = 0;
  for await (const newUser of generateUsers()) {
    const { pesel, ...newUserWithoutPesel } = newUser;
    const user = await prisma.user.create({
      data: newUserWithoutPesel,
    });

    usersCount++;
    if (usersCount <= 3) {
      await createDoctor(user);
    } else {
      await createPatient(user, pesel);
    }
  }
}

async function seed() {
  await seedSpecialities();
  await seedDummyUsers();

  const allUsers = await prisma.user.findMany({
    include: {
      doctor: { include: { medicalSpecializations: true } },
      patient: { include: { medicalData: true } },
    },
  });
  console.dir(allUsers, { depth: null });
}

seed()
  .catch((e) => {
    console.log(e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

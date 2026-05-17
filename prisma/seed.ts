const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Admin User',
      password: 'password', // in a real app, hash this
      role: 'ADMIN',
      department: 'HR',
    },
  })

  // Managers
  const managers = []
  for (let i = 1; i <= 3; i++) {
    const manager = await prisma.user.upsert({
      where: { email: `manager${i}@demo.com` },
      update: {},
      create: {
        email: `manager${i}@demo.com`,
        name: `Manager ${i}`,
        password: 'password',
        role: 'MANAGER',
        department: `Dept ${i}`,
      },
    })
    if (i === 1) { // Create manager@demo.com alias for easy login
        await prisma.user.upsert({
            where: { email: 'manager@demo.com' },
            update: {},
            create: {
              email: 'manager@demo.com',
              name: 'Demo Manager',
              password: 'password',
              role: 'MANAGER',
              department: 'Sales',
            },
        })
    }
    managers.push(manager)
  }

  const demoManager = await prisma.user.findUnique({ where: { email: 'manager@demo.com' } });

  // Employees
  for (let i = 1; i <= 10; i++) {
    const managerToAssign = i <= 4 ? demoManager : managers[i % 3];
    
    const isDemoEmployee = i === 1;
    const email = isDemoEmployee ? 'employee@demo.com' : `employee${i}@demo.com`;

    const emp = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: `Employee ${i}`,
        password: 'password',
        role: 'EMPLOYEE',
        department: managerToAssign.department,
        managerId: managerToAssign.id,
      },
    })

    // Create a Goal Sheet for them
    const sheet = await prisma.goalSheet.create({
      data: {
        userId: emp.id,
        status: isDemoEmployee ? 'APPROVED' : 'SUBMITTED',
        year: 2024,
      }
    })

    // Add goals
    await prisma.goal.create({
        data: {
            goalSheetId: sheet.id,
            title: 'Increase Sales by 10%',
            thrustArea: 'Revenue',
            uomType: 'Percentage',
            target: '10',
            weightage: 50,
            q1Actual: isDemoEmployee ? '2' : null,
            q1Status: isDemoEmployee ? 'On Track' : null,
        }
    })

    await prisma.goal.create({
        data: {
            goalSheetId: sheet.id,
            title: 'Launch New Feature',
            thrustArea: 'Product',
            uomType: 'Timeline',
            target: '2024-06-30',
            weightage: 50,
            q1Actual: isDemoEmployee ? 'In Progress' : null,
            q1Status: isDemoEmployee ? 'On Track' : null,
        }
    })
  }

  // Set system config
  await prisma.systemConfig.upsert({
    where: { key: 'cycle_windows' },
    update: {},
    create: {
      key: 'cycle_windows',
      value: JSON.stringify({
        goalSetting: { start: '2024-05-01', end: '2024-05-31', active: true },
        Q1: { start: '2024-07-01', end: '2024-07-31', active: true },
        Q2: { start: '2024-10-01', end: '2024-10-31', active: false },
        Q3: { start: '2025-01-01', end: '2025-01-31', active: false },
        Q4: { start: '2025-03-01', end: '2025-04-30', active: false },
      })
    }
  })

  console.log('Database seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

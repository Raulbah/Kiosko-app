import prisma from "@/lib/db";

async function main() {
    console.log('🌱 Iniciando Seed...');

    
    console.log('🔐 Iniciando Seed de Seguridad...');

    // 1. Limpiar tablas de Auth (Orden: Usuario -> Rol -> Permiso -> Módulo)
    // CUIDADO: Esto borrará usuarios existentes. Úsalo solo en dev.
    await prisma.user.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.module.deleteMany();
    // Asegúrate de tener una sucursal creada (usaremos la 'centro' del seed anterior o creamos una)
    const branch = await prisma.branch.findFirst() || await prisma.branch.create({
        data: { name: 'Sucursal Matriz', slug: 'matriz', address: 'Oficina Central' }
    });

    // 2. Definir Módulos del Sistema (Hardcoded slugs)
    const modulesData = [
        { name: 'Dashboard', slug: 'dashboard' },
        { name: 'Usuarios', slug: 'users' },
        { name: 'Roles y Permisos', slug: 'roles' },
        { name: 'Productos', slug: 'products' },
        { name: 'Categorías', slug: 'categories' },
        { name: 'Sucursales', slug: 'branches' },
        { name: 'Ordenes', slug: 'orders' },
        { name: 'Cocina', slug: 'kitchen' },
    ];

    await prisma.module.createMany({ data: modulesData });
    const allModules = await prisma.module.findMany();

    // 3. Crear Rol "Super Admin"
    const adminRole = await prisma.role.create({
        data: { name: 'Super Admin' }
    });

    // 4. Asignar TODOS los permisos al Super Admin
    const permissionsData = allModules.map(module => ({
        roleId: adminRole.id,
        moduleId: module.id,
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
    }));

    await prisma.permission.createMany({ data: permissionsData });

    // 5. Crear Usuario Admin
    // Password temporal = "123456" (Hasheado)
    const hashedPassword = await import("bcryptjs").then(bcrypt => bcrypt.hash("123456", 10));
    
    await prisma.user.create({
        data: {
            name: 'Administrador Sistema',
            employeeId: 'admin', // Usuario para Login
            password: hashedPassword,
            roleId: adminRole.id,
            branchId: branch.id,
            isActive: true,
        }
    });

    console.log('✅ Usuario Admin creado: user="admin" pass="123456"');
}
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
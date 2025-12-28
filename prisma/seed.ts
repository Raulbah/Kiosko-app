import prisma from "@/lib/db";

async function main() {
    console.log('🌱 Iniciando Seed...');

    // 1. Limpiar DB (Orden importa por claves foráneas)
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.branch.deleteMany();

    // 2. Crear Sucursales
    const centro = await prisma.branch.create({
        data: { name: 'Sucursal Centro', slug: 'centro', address: 'Av. Reforma 123' },
    });

    const norte = await prisma.branch.create({
        data: { name: 'Sucursal Norte', slug: 'norte', address: 'Plaza Norte Local 4' },
    });

    console.log(`✅ Sucursales creadas: ${centro.name}, ${norte.name}`);

    // 3. Crear Categorías
    const bebidas = await prisma.category.create({ data: { name: 'Bebidas', slug: 'bebidas' } });
    const comida = await prisma.category.create({ data: { name: 'Comida', slug: 'comida' } });
    const postres = await prisma.category.create({ data: { name: 'Postres', slug: 'postres' } });

    // 4. Crear Productos

    // --- GLOBALES (Disponibles en ambas) ---
    await prisma.product.createMany({
        data: [
        {
            name: 'Coca Cola 600ml',
            description: 'Refresco sabor cola bien frío',
            price: 25.00,
            categoryId: bebidas.id,
            branchId: null, // GLOBAL
        },
        {
            name: 'Agua Mineral',
            description: 'Botella 500ml',
            price: 20.00,
            categoryId: bebidas.id,
            branchId: null, // GLOBAL
        },
        ],
    });

    // --- EXCLUSIVOS CENTRO (Ej. Comida más gourmet) ---
    await prisma.product.create({
        data: {
            name: 'Tacos de Pastor (Orden)',
            description: '5 tacos con piña, cilantro y cebolla',
            price: 85.00,
            categoryId: comida.id,
            branchId: centro.id, // Solo Centro
        },
    });

    await prisma.product.create({
        data: {
            name: 'Cheesecake de Fresa',
            description: 'Rebanada estilo NY',
            price: 65.00,
            categoryId: postres.id,
            branchId: centro.id, // Solo Centro
        },
    });

    // --- EXCLUSIVOS NORTE (Ej. Comida rápida / Snacks) ---
    await prisma.product.create({
        data: {
            name: 'Burrito Norteño',
            description: 'Machaca con huevo y frijoles',
            price: 55.00,
            categoryId: comida.id,
            branchId: norte.id, // Solo Norte
        },
    });

    await prisma.product.create({
        data: {
            name: 'Nachos con Queso',
            description: 'Con jalapeños extra',
            price: 45.00,
            categoryId: comida.id,
            branchId: norte.id, // Solo Norte
        },
    });

    console.log('✅ Productos insertados');

    // 1. Crear Producto Complejo
    const fresas = await prisma.product.create({
        data: {
            name: 'Fresas con Crema',
            description: 'Vaso con nuestra crema especial.',
            price: 50.00, // Precio "Desde" (el del tamaño chico)
            categoryId: postres.id,
            branchId: centro.id,
            imageUrl: 'https://images.unsplash.com/photo-1579703496669-07f9175a1334?q=80&w=1000',
        },
    });

    // --- NUEVO: Crear Tamaños ---
    await prisma.productSize.createMany({
        data: [
            { name: 'Chico (300ml)', price: 50.00, productId: fresas.id },
            { name: 'Mediano (500ml)', price: 75.00, productId: fresas.id },
            { name: 'Grande (1L)', price: 110.00, productId: fresas.id },
        ]
    });

    // 2. Grupo: Toppings Base (Gratis, Max 2)
    const grupoBase = await prisma.modifierGroup.create({
        data: {
            name: 'Elige tus Toppings',
            minSelect: 0, 
            includedSelect: 2, // <--- Los primeros 2 son gratis
            maxSelect: 4,      // <--- Puedes elegir hasta 4 en total
            extraPrice: 5.00,  // <--- El 3ro y 4to costarán $5 cada uno
            productId: fresas.id,
        },
    });

    await prisma.modifierOption.createMany({
        data: [
            { name: 'Granola', price: 0, groupId: grupoBase.id },
            { name: 'Coco Rallado', price: 0, groupId: grupoBase.id },
            { name: 'Amaranto', price: 0, groupId: grupoBase.id },
            { name: 'Pasitas', price: 0, groupId: grupoBase.id },
            { name: 'Nuez', price: 0, groupId: grupoBase.id }, // La nuez aquí es "base"
        ],
    });


    // 3. Grupo: Extras (Con costo)
    const grupoExtras = await prisma.modifierGroup.create({
        data: {
        name: '¿Algo extra? (Costo adicional)',
        minSelect: 0,
        maxSelect: 5, // Límite alto
        productId: fresas.id,
        },
    });

    await prisma.modifierOption.createMany({
        data: [
        { name: 'Choco Krispis', price: 5, groupId: grupoExtras.id },
        { name: 'Nuez', price: 10, groupId: grupoExtras.id },
        { name: 'Porción Extra de Mango', price: 15, groupId: grupoExtras.id },
        ],
    });

    console.log('🍓 Fresas con toppings creadas');
}
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();

router.get('/banner',  async (req, res) => {
    try{

        const banner = await prisma.banner.findMany({
      where: {
        isActive: true
      },
      select: {
        bannerName: true,
        bannerImage: true,
        description: true
      },
      orderBy: {
        id: 'asc'
      }
    });

        res.status(200).json({
            status: 0,
            message: 'Profile image updated successfully',
            data: banner
        });
    }catch(error){

        console.error(error);
        res.status(400).json({
            status: 103,
            message: error.message
        });
    }
});

router.get('/services', async (req, res) => {
    try {
        const services = await prisma.product.findMany({
            where: {
                isActive: true
            },
            select: {
                code: true,
                name: true,
                price: true,
                service: {
                    select: {
                        category: {
                            select: {
                                icon: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                id: 'asc'
            }
        });

        const formattedServices = services.map(service => ({
            service_code: service.code,
            service_name: service.name,
            service_icon: service.service.category.icon || 'https://nutech-integrasi.app/dummy.jpg',
            service_tariff: service.price
        }));

        res.status(200).json({
            status: 0,
            message: 'Sukses',
            data: formattedServices
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            status: 108,
            message: 'Terjadi kesalahan pada sistem'
        });
    }
});




module.exports = router;
import logging
from datetime import time
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.scrap import ScrapCategory, ScrapItem
from app.models.category import Category
from app.models.service import Service
from app.models.timeslot import Timeslot
from app.models.maintenance import MaintenanceCategory, MaintenanceService

logger = logging.getLogger(__name__)

# Default Scrap Catalog Seed Data
DEFAULT_SCRAP_DATA = [
    {
        "name": "Paper Scrap",
        "icon": "file-text",
        "image": "https://www.homelectrical.com/sites/default/files/styles/original_image/public/images/product/blg/blg-cardboard_reuse.jpg",
        "description": "Paper and cardboard waste products",
        "items": [
            {"name": "Newspaper (Raddi)", "price_per_kg": 14.0, "description": "Daily newspapers"},
            {"name": "Books & Copies", "price_per_kg": 12.0, "description": "School books, notebooks, and copies"},
            {"name": "Office Paper", "price_per_kg": 15.0, "description": "A4 papers, printed office documents"},
            {"name": "Carton / Cardboard", "price_per_kg": 10.0, "description": "Cardboard packaging boxes"}
        ]
    },
    {
        "name": "Plastic Scrap",
        "icon": "trash-2",
        "image": "https://c8.alamy.com/comp/BMC4HW/crushed-green-plastic-bottle-waste-at-a-waste-recycling-plant-BMC4HW.jpg",
        "description": "Recyclable plastic items",
        "items": [
            {"name": "Plastic Bottles", "price_per_kg": 15.0, "description": "Water and beverage bottles"},
            {"name": "Hard Plastic", "price_per_kg": 18.0, "description": "Toys, containers, and sturdy items"},
            {"name": "Soft Plastic", "price_per_kg": 12.0, "description": "Carry bags and thin plastic sheets"},
            {"name": "Plastic Container", "price_per_kg": 14.0, "description": "Food delivery containers and jars"}
        ]
    },
    {
        "name": "Metal Scrap",
        "icon": "shield",
        "image": "https://www.scrapware.com/wp-content/uploads/2020/09/We-All-Benefit-from-Metal-Recycling-1.jpg",
        "description": "Household and industrial metal products",
        "items": [
            {"name": "Heavy Iron", "price_per_kg": 32.0, "description": "Heavy industrial/domestic iron scrap"},
            {"name": "Light Iron", "price_per_kg": 28.0, "description": "Light iron sheets and household wire items"},
            {"name": "Steel Items", "price_per_kg": 40.0, "description": "Stainless steel utensils and pipes"},
            {"name": "Copper", "price_per_kg": 450.0, "description": "Copper wire and electrical scrap"},
            {"name": "Aluminium", "price_per_kg": 120.0, "description": "Aluminium cans, utensils, and frames"},
            {"name": "Brass (Peetal)", "price_per_kg": 320.0, "description": "Brass utensils and decorative items"}
        ]
    },
    {
        "name": "E-Waste",
        "icon": "cpu",
        "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300&auto=format&fit=crop",
        "description": "Discarded electronic appliances and components",
        "items": [
            {"name": "Old TV / LED", "price_per_kg": 500.0, "description": "CRT television or LED monitor (price per unit)"},
            {"name": "Computer / Laptop", "price_per_kg": 800.0, "description": "Old desktops, laptops, and motherboards (price per unit)"},
            {"name": "Fridge / AC", "price_per_kg": 1500.0, "description": "Old refrigerator or air conditioner (price per unit)"},
            {"name": "Washing Machine", "price_per_kg": 1000.0, "description": "Defunct washing machine (price per unit)"},
            {"name": "Mobile Phones", "price_per_kg": 150.0, "description": "Discarded smart or feature phones (price per unit)"}
        ]
    },
    {
        "name": "Automobile Scrap",
        "icon": "truck",
        "image": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=300&auto=format&fit=crop",
        "description": "Vehicular scrap and spare parts",
        "items": [
            {"name": "Old Car", "price_per_kg": 15000.0, "description": "Scrap car without documents (price per unit)"},
            {"name": "Bike Scrap", "price_per_kg": 3500.0, "description": "Scrap two-wheeler (price per unit)"},
            {"name": "Car Parts", "price_per_kg": 100.0, "description": "Scrap vehicle batteries, chassis parts"}
        ]
    },
    {
        "name": "Household Scrap",
        "icon": "home",
        "image": "https://www.jdogjunkremoval.com/wp-content/uploads/2019/06/old-appliances-1024x1024.jpg",
        "description": "General domestic scrap",
        "items": [
            {"name": "Mixed Kabadi", "price_per_kg": 18.0, "description": "General mixed scrap items"},
            {"name": "Old Furniture", "price_per_kg": 50.0, "description": "Wooden chairs, broken tables, doors"},
            {"name": "Broken Items", "price_per_kg": 15.0, "description": "General broken household plastics and metals"}
        ]
    },
    {
        "name": "Industrial Scrap",
        "icon": "settings",
        "image": "https://www.okonrecycling.com/wp-content/uploads/2025/09/scrap_metal_factory_floor.png",
        "description": "Scrap from factories and construction sites",
        "items": [
            {"name": "Factory Scrap", "price_per_kg": 45.0, "description": "Industrial metal turnings and sheet cutouts"},
            {"name": "Construction Scrap", "price_per_kg": 38.0, "description": "Concrete reinforcement rods and structural elements"},
            {"name": "Sariya", "price_per_kg": 42.0, "description": "Iron reinforcement bars (TMT rebars)"},
            {"name": "Pipe", "price_per_kg": 35.0, "description": "GI and PVC industrial pipes"}
        ]
    },
    {
        "name": "Battery Scrap",
        "icon": "battery",
        "image": "https://www.battery.co.za/wp-content/uploads/2023/05/battery-Recycling.webp",
        "description": "Used and scrap batteries",
        "items": [
            {"name": "Inverter Battery", "price_per_kg": 800.0, "description": "Lead-acid inverter battery (price per unit)"},
            {"name": "Car Battery", "price_per_kg": 600.0, "description": "Used car battery (price per unit)"},
            {"name": "UPS Battery", "price_per_kg": 200.0, "description": "Small UPS battery (price per unit)"}
        ]
    },
    {
        "name": "Glass Scrap",
        "icon": "wine",
        "image": "https://c8.alamy.com/comp/M8JCBP/a-pile-of-glass-bottle-pieces-broken-glass-recycling-M8JCBP.jpg",
        "description": "Discarded glass bottles and sheets",
        "items": [
            {"name": "Glass Bottles", "price_per_kg": 5.0, "description": "Soft drink and beer bottles"},
            {"name": "Window Glass", "price_per_kg": 8.0, "description": "Window and door panes glass"},
            {"name": "Normal Glass", "price_per_kg": 4.0, "description": "Mixed broken glass pieces"}
        ]
    },
    {
        "name": "Textile Scrap",
        "icon": "shirt",
        "image": "https://talu.earth/wp-content/uploads/2022/08/3-2.png",
        "description": "Old clothes and fabric materials",
        "items": [
            {"name": "Old Clothes", "price_per_kg": 15.0, "description": "Damaged or unwanted clothes"},
            {"name": "Fabric Waste", "price_per_kg": 12.0, "description": "Leftover tailoring and industrial fabric bits"}
        ]
    }
]

def seed_scrap_data(db: Session):
    """
    Checks and seeds default Scrap categories/items. Granularly checks each category
    and item by name to ensure idempotency and complete partial seeds without duplicates.
    """
    try:
        logger.info("Seeding default Scrap catalog data...")
        categories_created = 0
        categories_updated = 0
        items_created = 0
        items_updated = 0

        for cat_data in DEFAULT_SCRAP_DATA:
            category = db.execute(
                select(ScrapCategory).where(ScrapCategory.name == cat_data["name"])
            ).scalar_one_or_none()

            if not category:
                category = ScrapCategory(
                    name=cat_data["name"],
                    icon=cat_data["icon"],
                    image=cat_data["image"],
                    description=cat_data["description"],
                    active=True
                )
                db.add(category)
                db.flush()  # get category ID
                categories_created += 1
                logger.info(f"Created Scrap category: {cat_data['name']}")
            else:
                category.icon = cat_data["icon"]
                category.image = cat_data["image"]
                category.description = cat_data["description"]
                db.flush()
                categories_updated += 1

            for item_data in cat_data["items"]:
                item = db.execute(
                    select(ScrapItem)
                    .where(ScrapItem.category_id == category.id)
                    .where(ScrapItem.name == item_data["name"])
                ).scalar_one_or_none()

                if not item:
                    item = ScrapItem(
                        category_id=category.id,
                        name=item_data["name"],
                        price_per_kg=item_data["price_per_kg"],
                        description=item_data["description"],
                        active=True
                    )
                    db.add(item)
                    items_created += 1
                    logger.info(f"Created Scrap item: {item_data['name']} under {cat_data['name']}")
                else:
                    item.price_per_kg = item_data["price_per_kg"]
                    item.description = item_data["description"]
                    items_updated += 1

        db.commit()
        logger.info(
            f"Scrap seeding complete: "
            f"{categories_created} categories created, {categories_updated} updated; "
            f"{items_created} items created, {items_updated} updated."
        )
        return {
            "categories_created": categories_created,
            "categories_updated": categories_updated,
            "items_created": items_created,
            "items_updated": items_updated
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding Scrap catalog: {e}")
        raise e


# Default Beautician Catalog Seed Data
DEFAULT_BEAUTICIAN_DATA = [
    {
        "name": "Facial & Skincare",
        "icon": "face-woman",
        "image": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop",
        "description": "Premium facial and skin rejuvenation treatments",
        "services": [
            {"name": "Fruit Facial", "price": 499.0, "duration": 45, "image": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=300&auto=format&fit=crop", "description": "Refreshing fruit facial for glowing skin"},
            {"name": "Gold Facial", "price": 799.0, "duration": 60, "image": "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=300&auto=format&fit=crop", "description": "Premium gold facial for special occasions"},
            {"name": "Hydra Facial", "price": 1999.0, "duration": 90, "image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=300&auto=format&fit=crop", "description": "Advanced skin hydration and deep cleansing"}
        ]
    },
    {
        "name": "Waxing",
        "icon": "water",
        "image": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=600&auto=format&fit=crop",
        "description": "Smooth waxing services by professionals",
        "services": [
            {"name": "Full Body Waxing", "price": 1499.0, "duration": 75, "image": "https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=300&auto=format&fit=crop", "description": "Complete body hair removal service"},
            {"name": "Chocolate Waxing (Arms & Legs)", "price": 350.0, "duration": 45, "image": "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=300&auto=format&fit=crop", "description": "Soothing chocolate waxing for arms and legs"}
        ]
    },
    {
        "name": "Hand & Feet Care",
        "icon": "spa",
        "image": "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=600&auto=format&fit=crop",
        "description": "Manicures, pedicures, and nail pampering",
        "services": [
            {"name": "Spa Pedicure", "price": 799.0, "duration": 60, "image": "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=300&auto=format&fit=crop", "description": "Relaxing foot massage and pedicure spa"},
            {"name": "Spa Manicure", "price": 699.0, "duration": 45, "image": "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=300&auto=format&fit=crop", "description": "Rejuvenating hand treatment and manicure spa"}
        ]
    },
    {
        "name": "Hair Services",
        "icon": "scissors",
        "image": "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop",
        "description": "Hair cuts, coloring, styling, and nourishing spas",
        "services": [
            {"name": "Hair Cut & Styling", "price": 499.0, "duration": 30, "image": "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=300&auto=format&fit=crop", "description": "Professional hair cut and styling by experts"},
            {"name": "Hair Spa & Nourishment", "price": 799.0, "duration": 60, "image": "https://images.unsplash.com/photo-1527799851257-3593d86385c7?q=80&w=300&auto=format&fit=crop", "description": "Deep conditioning and scalp massage hair spa"}
        ]
    },
    {
        "name": "Makeup Categories",
        "icon": "brush",
        "image": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600&auto=format&fit=crop",
        "description": "Exquisite bridal and event makeup services",
        "services": [
            {"name": "Cocktail Party Makeup", "price": 3999.0, "duration": 90, "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300&auto=format&fit=crop", "description": "Stunning party makeup by professional artists"},
            {"name": "Engagement Makeup", "price": 7999.0, "duration": 120, "image": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=300&auto=format&fit=crop", "description": "Exquisite makeup for your special engagement day"}
        ]
    }
]

def seed_beautician_data(db: Session):
    """
    Checks and seeds default Beautician categories/services. Granularly checks each category
    and service by name to ensure idempotency and complete partial seeds without duplicates.
    """
    try:
        logger.info("Seeding default Beautician catalog data...")
        categories_created = 0
        categories_updated = 0
        services_created = 0
        services_updated = 0

        for cat_data in DEFAULT_BEAUTICIAN_DATA:
            category = db.execute(
                select(Category).where(Category.name == cat_data["name"])
            ).scalar_one_or_none()

            if not category:
                category = Category(
                    name=cat_data["name"],
                    icon=cat_data["icon"],
                    image=cat_data["image"],
                    description=cat_data["description"],
                    active=True
                )
                db.add(category)
                db.flush()  # get category ID
                categories_created += 1
                logger.info(f"Created Beautician category: {cat_data['name']}")
            else:
                category.icon = cat_data["icon"]
                category.image = cat_data["image"]
                category.description = cat_data["description"]
                db.flush()
                categories_updated += 1

            for service_data in cat_data["services"]:
                service = db.execute(
                    select(Service)
                    .where(Service.category_id == category.id)
                    .where(Service.name == service_data["name"])
                ).scalar_one_or_none()

                if not service:
                    service = Service(
                        category_id=category.id,
                        name=service_data["name"],
                        price=service_data["price"],
                        duration=service_data["duration"],
                        image=service_data["image"],
                        description=service_data["description"],
                        active=True
                    )
                    db.add(service)
                    services_created += 1
                    logger.info(f"Created Beautician service: {service_data['name']} under {cat_data['name']}")
                else:
                    service.price = service_data["price"]
                    service.duration = service_data["duration"]
                    service.image = service_data["image"]
                    service.description = service_data["description"]
                    services_updated += 1

                db.flush()
                
                # Ensure timeslots exist for this service
                existing_slots = db.execute(
                    select(Timeslot).where(Timeslot.service_id == service.id)
                ).scalars().all()

                if not existing_slots:
                    default_slots = [
                        (time(9, 0), time(10, 0)),
                        (time(10, 0), time(11, 0)),
                        (time(11, 0), time(12, 0)),
                        (time(13, 0), time(14, 0)),
                        (time(14, 0), time(15, 0)),
                        (time(15, 0), time(16, 0)),
                        (time(16, 0), time(17, 0))
                    ]
                    for start_t, end_t in default_slots:
                        slot = Timeslot(
                            service_id=service.id,
                            start_time=start_t,
                            end_time=end_t,
                            active=True
                        )
                        db.add(slot)
                    logger.info(f"Seeded default timeslots for service: {service.name}")

        db.commit()
        logger.info(
            f"Beautician seeding complete: "
            f"{categories_created} categories created, {categories_updated} updated; "
            f"{services_created} services created, {services_updated} updated."
        )
        return {
            "categories_created": categories_created,
            "categories_updated": categories_updated,
            "services_created": services_created,
            "services_updated": services_updated
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding Beautician catalog: {e}")
        raise e


# Default Maintenance Catalog Seed Data
DEFAULT_MAINTENANCE_DATA = [
    {
        "name": "AC Repair & Service",
        "icon": "wind",
        "image": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop",
        "description": "Professional AC servicing, repair, gas charging, and installation",
        "services": [
            {"name": "AC Regular Service", "price": 499.0, "duration": 45, "image": "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?q=80&w=300&auto=format&fit=crop", "description": "Filter cleaning, cooling coil check, and basic service"},
            {"name": "AC Deep Cleaning", "price": 899.0, "duration": 75, "image": "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=300&auto=format&fit=crop", "description": "Foam wash cleaning for deep dust removal"},
            {"name": "AC Installation", "price": 1499.0, "duration": 90, "image": "https://images.unsplash.com/photo-1545558014-8692077e9b5c?q=80&w=300&auto=format&fit=crop", "description": "Installation of split or window AC by certified professionals"}
        ]
    },
    {
        "name": "Electrical Services",
        "icon": "zap",
        "image": "https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=600&auto=format&fit=crop",
        "description": "Switch, socket, fan, light, and wiring repair or installation",
        "services": [
            {"name": "Switch / Socket Repair", "price": 99.0, "duration": 20, "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=300&auto=format&fit=crop", "description": "Fixing loose contacts, burnt switches, or socket replacement"},
            {"name": "Ceiling Fan Repair", "price": 199.0, "duration": 40, "image": "https://images.unsplash.com/photo-1618944847023-38aa001235f0?q=80&w=300&auto=format&fit=crop", "description": "Capacitor replacement, noise fixing, or installation"},
            {"name": "Complete House Inspection", "price": 499.0, "duration": 60, "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=300&auto=format&fit=crop", "description": "Complete electrical health checkup of your house"}
        ]
    },
    {
        "name": "Plumbing Services",
        "icon": "droplet",
        "image": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=600&auto=format&fit=crop",
        "description": "Leak fix, tap installation, toilet repair, and drain cleaning",
        "services": [
            {"name": "Tap Repair / Replacement", "price": 149.0, "duration": 30, "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&auto=format&fit=crop", "description": "Fixing dripping taps or installing a new tap"},
            {"name": "Drain Unclogging", "price": 299.0, "duration": 45, "image": "https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?q=80&w=300&auto=format&fit=crop", "description": "Clearing minor blockages in sinks or bathrooms"},
            {"name": "Toilet Jet Spray Install", "price": 199.0, "duration": 25, "image": "https://images.unsplash.com/photo-1521207418485-99c705420785?q=80&w=300&auto=format&fit=crop", "description": "Installation or repair of jet sprays or hand faucets"}
        ]
    }
]

def seed_maintenance_data(db: Session):
    """
    Checks and seeds default Maintenance categories/services. Granularly checks each category
    and service by name to ensure idempotency and complete partial seeds without duplicates.
    """
    try:
        logger.info("Seeding default Maintenance catalog data...")
        categories_created = 0
        categories_updated = 0
        services_created = 0
        services_updated = 0

        for cat_data in DEFAULT_MAINTENANCE_DATA:
            category = db.execute(
                select(MaintenanceCategory).where(MaintenanceCategory.name == cat_data["name"])
            ).scalar_one_or_none()

            if not category:
                category = MaintenanceCategory(
                    name=cat_data["name"],
                    icon=cat_data["icon"],
                    image=cat_data["image"],
                    description=cat_data["description"],
                    active=True
                )
                db.add(category)
                db.flush()  # get category ID
                categories_created += 1
                logger.info(f"Created Maintenance category: {cat_data['name']}")
            else:
                category.icon = cat_data["icon"]
                category.image = cat_data["image"]
                category.description = cat_data["description"]
                db.flush()
                categories_updated += 1

            for service_data in cat_data["services"]:
                service = db.execute(
                    select(MaintenanceService)
                    .where(MaintenanceService.category_id == category.id)
                    .where(MaintenanceService.name == service_data["name"])
                ).scalar_one_or_none()

                if not service:
                    service = MaintenanceService(
                        category_id=category.id,
                        name=service_data["name"],
                        price=service_data["price"],
                        duration=service_data["duration"],
                        image=service_data["image"],
                        description=service_data["description"],
                        active=True
                    )
                    db.add(service)
                    services_created += 1
                    logger.info(f"Created Maintenance service: {service_data['name']} under {cat_data['name']}")
                else:
                    service.price = service_data["price"]
                    service.duration = service_data["duration"]
                    service.image = service_data["image"]
                    service.description = service_data["description"]
                    services_updated += 1

        db.commit()
        logger.info(
            f"Maintenance seeding complete: "
            f"{categories_created} categories created, {categories_updated} updated; "
            f"{services_created} services created, {services_updated} updated."
        )
        return {
            "categories_created": categories_created,
            "categories_updated": categories_updated,
            "services_created": services_created,
            "services_updated": services_updated
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding Maintenance catalog: {e}")
        raise e


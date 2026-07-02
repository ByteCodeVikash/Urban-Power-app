#!/usr/bin/env python
import os
import sys
import logging

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.core.seeding import seed_scrap_data, seed_beautician_data, seed_maintenance_data

# Set up logging to stdout with clean formatting
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("seed_script")

def main():
    logger.info("Starting database catalog seeding process...")
    db = SessionLocal()
    try:
        # Run seeding functions
        scrap_results = seed_scrap_data(db)
        beautician_results = seed_beautician_data(db)
        maintenance_results = seed_maintenance_data(db)

        logger.info("=" * 50)
        logger.info("SEEDING SUMMARY")
        logger.info("=" * 50)
        
        logger.info("Scrap Catalog:")
        logger.info(f"  Categories: Created={scrap_results.get('categories_created', 0)}, Updated={scrap_results.get('categories_updated', 0)}")
        logger.info(f"  Items:      Created={scrap_results.get('items_created', 0)}, Updated={scrap_results.get('items_updated', 0)}")
        
        logger.info("Beautician Catalog:")
        logger.info(f"  Categories: Created={beautician_results.get('categories_created', 0)}, Updated={beautician_results.get('categories_updated', 0)}")
        logger.info(f"  Services:   Created={beautician_results.get('services_created', 0)}, Updated={beautician_results.get('services_updated', 0)}")
        
        logger.info("Maintenance Catalog:")
        logger.info(f"  Categories: Created={maintenance_results.get('categories_created', 0)}, Updated={maintenance_results.get('categories_updated', 0)}")
        logger.info(f"  Services:   Created={maintenance_results.get('services_created', 0)}, Updated={maintenance_results.get('services_updated', 0)}")
        
        logger.info("=" * 50)
        logger.info("Database seeding completed successfully.")
        
    except Exception as e:
        logger.error(f"Seeding failed with exception: {e}", exc_info=True)
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()

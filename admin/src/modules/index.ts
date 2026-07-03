import { ModuleRegistry } from './registry';
import { OrdersModule } from './orders';
import { UsersModule } from './users';
import { PaymentsModule } from './payments';
import { ReportsModule } from './reports';
import { TechniciansModule } from './technicians';
import { ServicesModule } from './services';
import { SettingsModule } from './settings';
import { SupportModule } from './support';
import { CouponsModule } from './coupons';
import { CMSModule } from './cms';

// Register all core feature modules dynamically
ModuleRegistry.register(OrdersModule);
ModuleRegistry.register(UsersModule);
ModuleRegistry.register(PaymentsModule);
ModuleRegistry.register(ReportsModule);
ModuleRegistry.register(TechniciansModule);
ModuleRegistry.register(ServicesModule);
ModuleRegistry.register(SettingsModule);
ModuleRegistry.register(SupportModule);
ModuleRegistry.register(CouponsModule);
ModuleRegistry.register(CMSModule);

// Export the registry for reference
export { ModuleRegistry } from './registry';

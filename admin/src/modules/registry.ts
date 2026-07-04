import React from 'react';
import type { Permission } from '../config/roles';

export interface ModuleRoute {
  path: string;
  element: React.ComponentType<any>;
  requiredPermission?: Permission;
}

export interface MenuItemConfig {
  title: string;
  icon: string; // Key of MuiIcon mapping
  route: string;
  permission?: Permission;
  children?: MenuItemConfig[];
  futureModule?: boolean;
}

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  defaultLayout?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export interface Module {
  id: string;
  name: string;
  routes: ModuleRoute[];
  menuItems: MenuItemConfig[];
  dashboardWidgets?: DashboardWidgetConfig[];
}

class Registry {
  private modules: Map<string, Module> = new Map();

  /**
   * Registers a new module dynamically
   */
  public register(module: Module): void {
    if (this.modules.has(module.id)) {
      console.warn(
        `Module with ID "${module.id}" is already registered. Overwriting.`,
      );
    }
    this.modules.set(module.id, module);
  }

  /**
   * Unregisters a module
   */
  public unregister(moduleId: string): void {
    this.modules.delete(moduleId);
  }

  /**
   * Gets all registered modules
   */
  public getModules(): Module[] {
    return Array.from(this.modules.values());
  }

  /**
   * Aggregates all routes from all registered modules
   */
  public getRoutes(): ModuleRoute[] {
    const routes: ModuleRoute[] = [];
    this.getModules().forEach(mod => {
      routes.push(...mod.routes);
    });
    return routes;
  }

  /**
   * Aggregates all menu items from registered modules
   */
  public getMenuItems(): MenuItemConfig[] {
    const menuItems: MenuItemConfig[] = [];
    this.getModules().forEach(mod => {
      menuItems.push(...mod.menuItems);
    });
    return menuItems;
  }

  /**
   * Aggregates all dashboard widgets from registered modules
   */
  public getDashboardWidgets(): DashboardWidgetConfig[] {
    const widgets: DashboardWidgetConfig[] = [];
    this.getModules().forEach(mod => {
      if (mod.dashboardWidgets) {
        widgets.push(...mod.dashboardWidgets);
      }
    });
    return widgets;
  }
}

export const ModuleRegistry = new Registry();
export default ModuleRegistry;

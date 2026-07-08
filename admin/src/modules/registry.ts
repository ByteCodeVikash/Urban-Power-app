import React from 'react';
import type { Permission } from '../config/roles';
import { menuConfig } from '../config/menuConfig';
import type { MenuItem } from '../config/menuConfig';

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
  requiredPermission?: Permission;
}

export interface Module {
  id: string;
  name: string;
  routes: ModuleRoute[];
  menuItems: MenuItemConfig[];
  dashboardWidgets?: DashboardWidgetConfig[];
}

export const findPermissionForRoute = (
  routePath: string,
): Permission | undefined => {
  let bestMatch: any = undefined;

  const search = (items: MenuItem[]) => {
    for (const item of items) {
      if (item.route === routePath) {
        bestMatch = item;
        return;
      }
      if (item.route !== '/' && routePath.startsWith(item.route)) {
        if (!bestMatch || item.route.length > bestMatch.route.length) {
          bestMatch = item;
        }
      }
      if (item.children) {
        search(item.children);
      }
    }
  };

  search(menuConfig);
  const found = bestMatch as MenuItem | undefined;
  return found?.permission;
};

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
      mod.routes.forEach(route => {
        const resolvedPermission = findPermissionForRoute(route.path);
        routes.push({
          ...route,
          requiredPermission: resolvedPermission,
        });
      });
    });
    return routes;
  }

  /**
   * Aggregates all menu items from registered modules
   */
  public getMenuItems(): MenuItemConfig[] {
    const menuItems: MenuItemConfig[] = [];

    const resolveItemPermission = (item: MenuItemConfig): MenuItemConfig => {
      const resolvedPermission = findPermissionForRoute(item.route);
      const children = item.children
        ? item.children.map(resolveItemPermission)
        : undefined;
      return {
        ...item,
        permission: resolvedPermission,
        children,
      };
    };

    this.getModules().forEach(mod => {
      mod.menuItems.forEach(item => {
        menuItems.push(resolveItemPermission(item));
      });
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
        const firstRoute = mod.menuItems[0]?.route;
        const resolvedPermission = firstRoute
          ? findPermissionForRoute(firstRoute)
          : undefined;

        mod.dashboardWidgets.forEach(widget => {
          widgets.push({
            ...widget,
            requiredPermission: resolvedPermission,
          });
        });
      }
    });
    return widgets;
  }
}

export const ModuleRegistry = new Registry();
export default ModuleRegistry;

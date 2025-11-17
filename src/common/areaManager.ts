import { PluginManager } from './pluginManager';

type AreaPlugins = Set<string>;

export class AreaManager {
  private static areas: Map<string, AreaPlugins> = new Map();

  static registerToArea(areaName: string, pluginName: string) {
    if (!this.areas.has(areaName)) {
      this.areas.set(areaName, new Set<string>());
    }
    const set = this.areas.get(areaName)!;
    set.add(pluginName);
  }

  static async renderArea(areaName: string): Promise<string> {
    const set = this.areas.get(areaName);
    if (!set || set.size === 0) return '';

    const htmlParts: string[] = [];
    for (const pluginName of set) {
      const plugin = PluginManager.getPlugin(pluginName);
      if (!plugin) continue;
      const out = await plugin.render();
      htmlParts.push(out ?? '');
    }
    return htmlParts.join('\n');
  }

  // Untuk keperluan pengujian/debugging
  static reset() {
    this.areas.clear();
  }
}

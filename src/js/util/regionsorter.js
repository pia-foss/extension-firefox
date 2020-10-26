import * as compare from '@helpers/compare';

class RegionSorter {
  // eslint-disable-next-line class-methods-use-this
  nameSort(regions) {
    return regions.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  latencySort(regions) {
    return regions.sort((a, b) => {
      return compare.byLatency(a.latency, b.latency);
    });
  }
}

export default RegionSorter;

export default function counter() {
  const self = this;
  const table = {};

  self.get = (member) => { return table[member] || 0; };
  self.inc = (member) => { table[member] = (table[member] || 0) + 1; };
  self.del = (member) => { delete table[member]; };

  return self;
}

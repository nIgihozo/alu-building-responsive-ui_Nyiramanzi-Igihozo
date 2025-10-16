import { load, save } from "./storage.js";

let data = load();

export function addRecord(record) {
  data.push(record);
  save(data);
  return record;
}

export function getAll() {
  return [...data];
}

export function updateRecord(id, updated) {
  const index = data.findIndex(t => t.id === id);
  if (index !== -1) {
    data[index] = updated;
    save(data);
  }
}

export function deleteRecord(id) {
  data = data.filter(t => t.id !== id);
  save(data);
}

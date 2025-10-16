const KEY = "finance:data";

export function load() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

export function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

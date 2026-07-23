async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/settings/modules");
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);
  } catch (e) {
    console.error(e);
  }
}
test();

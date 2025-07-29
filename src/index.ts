const FIREBASE_URL = "https://zylos-test-default-rtdb.firebaseio.com";
const FIREBASE_SECRET = "N2FdqX2n0z4zhiSKp5nq2Q8MXr7UZ9fZRY2hPxlJ";

type User = {
  email: string;
  password: string;
};

async function writeToFirebase(path: string, data: any): Promise<Response> {
  const url = `${FIREBASE_URL}/${path}.json?auth=${FIREBASE_SECRET}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res;
}

async function readFromFirebase(path: string): Promise<any> {
  const url = `${FIREBASE_URL}/${path}.json?auth=${FIREBASE_SECRET}`;
  const res = await fetch(url);
  return res.json();
}

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/signup") {
      const body = await req.json() as User;
      const encodedEmail = encodeURIComponent(body.email);
      const user = await readFromFirebase(`users/${encodedEmail}`);

      if (user && user.password) {
        return new Response("User already exists", { status: 400 });
      }

      await writeToFirebase(`users/${encodedEmail}`, {
        email: body.email,
        password: body.password,
      });

      return new Response("User created successfully ✅", { status: 201 });
    }

    if (req.method === "POST" && url.pathname === "/login") {
      const body = await req.json() as User;
      const encodedEmail = encodeURIComponent(body.email);
      const user = await readFromFirebase(`users/${encodedEmail}`);

      if (!user || user.password !== body.password) {
        return new Response("Invalid credentials", { status: 401 });
      }

      return new Response("Login successful 🎉", { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  },
};

import { Application, Router, Status } from "oak";
import { oakCors } from "cors";
import {
  User,
  createUser,
  deleteUser,
  deleteUsers,
  getUser,
  isUserExists,
  listUsers,
  regeneratePowerUpSlotsInRoom,
  updateUserFields,
} from "./dal.ts";

const SERVER_ACCESS_TOKEN = Deno.env.get("CFP_SERVER_ACCESS_TOKEN") || "";
const app = new Application();
const router = new Router();

router
  .get("/", ({ response }) => {
    response.redirect("https://schwarzkopfb.codes/cf-plus");
  })
  .put("/user", async function ({ request, response, assert }) {
    const result = request.body();
    assert(result.type === "json", Status.BadRequest);
    const { username, numOfPowerUps, roomId } = await result.value;
    assert(
      typeof username === "string" && username.length > 0,
      Status.BadRequest,
      "Username must be a non-empty string",
    );
    assert(
      Number.isInteger(numOfPowerUps) && numOfPowerUps > 0 &&
        numOfPowerUps <= 30,
      Status.BadRequest,
      "Number of power-ups must be a positive integer between 1 and 30",
    );
    assert(
      typeof roomId === "string" && roomId.length > 0,
      Status.BadRequest,
      "Room ID must be a non-empty string",
    );

    let user = await getUser(username);
    if (user) {
      const fieldsToUpdate: Partial<User> = {};
      let changed = false;

      if (user.roomId !== roomId) {
        fieldsToUpdate.roomId = user.roomId = roomId;
        changed = true;
      }
      if (user.numOfPowerUps !== numOfPowerUps) {
        fieldsToUpdate.numOfPowerUps = user.numOfPowerUps = numOfPowerUps;
        changed = true;
      }
      if (changed) {
        await updateUserFields(username, fieldsToUpdate);
      }

      response.status = Status.OK;
    } else {
      user = await createUser(username, numOfPowerUps, roomId);
      response.status = Status.Created;
    }

    response.body = user;
  })
  .get("/user/:username", async ({ response, params }) => {
    const user = await getUser(params.username);

    if (user) {
      response.status = Status.OK;
      response.body = user;
    } else {
      response.status = Status.NotFound;
    }
  })
  .delete("/user/:username", async ({ response, params }) => {
    const username = params.username;

    if (await isUserExists(username)) {
      await deleteUser(username);
      response.status = Status.OK;
    } else {
      response.status = Status.NotFound;
    }
  })
  .get("/users", async ({ response }) => {
    response.body = await listUsers();
  })
  .delete("/users", async ({ response }) => {
    await deleteUsers();
    response.status = Status.OK;
  })
  .patch("/room/:id/powerups", async ({ response, params }) => {
    await regeneratePowerUpSlotsInRoom(params.id);
    response.status = Status.OK;
  });

app.use(oakCors());

if (SERVER_ACCESS_TOKEN) {
  app.use(async ({ request, response }, next) => {
    if (
      request.url.pathname !== "/" && !(
        request.headers.get("X-Access-Token") === SERVER_ACCESS_TOKEN ||
        request.url.searchParams.get("access_token") === SERVER_ACCESS_TOKEN
      )
    ) {
      response.status = Status.Unauthorized;
      return;
    }

    await next();
  });
}

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener(
  "listen",
  () => console.log("server is ready to accept connections on port 8080"),
);

await app.listen({ port: 8080 });

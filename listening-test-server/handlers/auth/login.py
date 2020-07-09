from handlers.base import BaseHandler


class LoginHandler(BaseHandler):
    async def get(self):
        # Request the _xsrf cookies interface.
        if self.xsrf_token:
            # Check user logged or not
            if self.get_current_user():
                # Get user information
                user = self.db['users'].find_one({'_id': self.get_current_user()})
                del user['password']
                self.dumps_write(user)
            else:
                self.send_error(200, 'No user login')
        else:
            self.send_error(200, "No xsrf token, set csrf token successfully")

    async def post(self):
        body = self.loads_body()
        user = self.db['users'].find_one({'email': body["email"]})
        if not user:
            self.send_error(404, "User not found")
            return

        # hashed_password = yield executor.submit(
        #     bcrypt.hashpw, tornado.escape.utf8(self.get_argument("password")),
        #     tornado.escape.utf8(author.hashed_password))

        if str(body["password"]) == str(user["password"]):
            # Set_secure_cookie, which cannot be get by browser
            self.set_secure_cookie("_user", str(user["_id"]), httponly=True, secure=False)
            del user['password']
            self.dumps_write(user)
            # self.redirect(self.get_argument("next", "/"))
        else:
            self.send_error(401, "Incorrect password")

    async def delete(self):
        self.clear_cookie("_user")
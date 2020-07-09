from abc import ABC
from typing import Optional
import bson
import tornado.web
from bson import ObjectId
from bson.json_util import dumps, loads
from pymongo.collection import Collection
from mongodbconnection import MongoDBConnection, CJsonEncoder


class BaseHandler(tornado.web.RequestHandler, ABC):
    def __init__(self, application, request, **kwargs):
        super().__init__(application, request, **kwargs)
        self.user_id: Optional[ObjectId] = None
        # Current db means the db which a handler is currently using
        self.mongo_client = MongoDBConnection().client
        self.db = MongoDBConnection().db

    # When data received, it will be called before PUT and POST
    def data_received(self, chunk):
        pass

    # The connection start
    def prepare(self):
        pass

    def set_default_headers(self) -> None:
        self.set_header("Content-Type", "application/json")

    def on_finish(self):
        self.mongo_client.close()

    # Custom error handling
    def send_error(self, status_code: int = 500, reason: str = None) -> None:
        self.set_status(status_code, reason)
        self.write(f'{status_code}: {reason}')

    # Write BSON data to client
    def dumps_write(self, data):
        json_data = dumps(data, json_options=bson.json_util.RELAXED_JSON_OPTIONS)
        self.write(json_data)

    # Loads BSON from request body
    def loads_body(self):
        body = self.request.body
        return loads(body, json_options=bson.json_util.RELAXED_JSON_OPTIONS)

    # If in the development, may need this function. For server side render
    # def set_default_headers(self):
    #     self.set_header("Access-Control-Allow-Origin", "http://localhost:4200")
    #     self.set_header("Access-Control-Allow-Headers", "x-requested-with")
    #     self.set_header('Access-Control-Allow-Methods', 'GET, OPTIONS')

    # if no login send 403, else return id with ObjectId
    def get_current_user(self):
        id_user = self.get_secure_cookie("_user", None)
        if not id_user:
            self.send_error(403, "You don't have permission")
            return None
        else:
            return ObjectId(id_user.decode("utf-8"))

    def auth_current_user(self) -> ObjectId:
        user_id = self.get_current_user()
        if user_id is None:
            raise tornado.web.Finish
        else:
            return user_id
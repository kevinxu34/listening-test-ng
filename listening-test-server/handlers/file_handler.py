import tornado.web

from handlers.base import BaseHandler
from tools import file_helper


class FileHandler(BaseHandler):
    async def prepare(self):
        await self.auth_current_user()

    async def post(self):
        # Switch to different folder for different task
        if "audioFile" in self.request.files:
            file_metas = self.request.files["audioFile"]
            # Just use the first file
            url = file_helper.write_in_md5(file_metas[0], 'audio_files')
        elif 'imageFile' in self.request.files:
            file_metas = self.request.files['imageFile']
            url = file_helper.write_in_md5(file_metas[0], 'imageFile')
        else:
            raise tornado.web.Finish
        self.write(url)
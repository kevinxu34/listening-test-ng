from handlers.base import BaseHandler
from tools import file_helper


class AudioFileHandler(BaseHandler):
    def prepare(self):
        self.auth_current_user()

    async def post(self):
        file_metas = self.request.files["audioFile"]
        url = file_helper.write_in_md5(file_metas[0], 'audio_files')
        self.write(url)
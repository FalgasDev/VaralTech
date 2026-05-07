class EmptyStringError(Exception):
    def __init__(self, message):
        self.message = message

class AuthError(Exception):
    def __init__(self, message):
        self.message = message

class NotFoundError(Exception):
    def __init__(self, message):
        self.message = message

class ForbiddenError(Exception):
    def __init__(self, message):
        self.message = message

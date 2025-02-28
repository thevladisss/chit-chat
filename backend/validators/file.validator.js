class FileValidator {
  constructor(file) {
    this.file = file;
  }

  file;
  result = true;

  getResult() {
    return this.result;
  }

  mimetype(expected) {
    this.result = this.file.mimetype === expected;

    return this;
  }
  extension(expected) {
    this.result = this.file.mimetype.endsWith(expected);

    return this;
  }
  maxSize(expected) {
    this.result = this.file.size <= expected;

    return this;
  }
}

module.exports = FileValidator;

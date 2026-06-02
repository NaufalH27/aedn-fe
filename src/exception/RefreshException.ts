export class NoRefreshError extends Error {
  constructor(message = "No refresh token found") {
    super(message);
    this.name = "NoRefreshError";
  }
}

export class InvalidRefreshError extends Error {
  constructor(message = "Invalid refresh token") {
    super(message);
    this.name = "InvalidRefreshError";
  }
}

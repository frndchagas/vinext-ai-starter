import "@typespec/http";
import "@typespec/openapi";

using Http;
using OpenAPI;

@service(#{ title: "Vinext AI Starter API" })
namespace VinextAiStarter;

@doc("RFC 9457 problem details.")
model Problem {
  type: string;
  title: string;
  status: int32;
  detail?: string;
}

@doc("RFC 9457 problem details with a stable map of field validation errors.")
model ValidationProblem {
  ...Problem;
  errors: Record<string[]>;
}

@error
model UnauthorizedResponse {
  @statusCode statusCode: 401;
  @header contentType: "application/problem+json";
  @body body: Problem;
}

@error
model ForbiddenResponse {
  @statusCode statusCode: 403;
  @header contentType: "application/problem+json";
  @body body: Problem;
}

@error
model ValidationErrorResponse {
  @statusCode statusCode: 422;
  @header contentType: "application/problem+json";
  @body body: ValidationProblem;
}

@doc("The authenticated identity, its roles and permissions.")
model Me {
  @doc("Opaque identifier. Clients must not infer meaning from its value.")
  id: string;

  name: string;
  email: string;
  email_verified: boolean;
  roles: string[];
  permissions: string[];
}

model RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

model LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

model LoginResult {
  two_factor: boolean;
}

model StatusMessage {
  message: string;
}

@tag("Auth")
@route("/api/v1/auth")
namespace Auth {
  @operationId("register")
  @doc("Register a new user. Controlled by the registration feature flag.")
  @route("/register")
  @post
  op register(@body body: RegisterRequest):
    | CreatedResponse
    | ForbiddenResponse
    | ValidationErrorResponse;

  @operationId("login")
  @route("/login")
  @post
  op login(@body body: LoginRequest): {
    @statusCode statusCode: 200;
    @body body: LoginResult;
  } | ValidationErrorResponse;

  @operationId("logout")
  @route("/logout")
  @post
  op logout(): NoContentResponse | UnauthorizedResponse;

  @operationId("forgotPassword")
  @route("/forgot-password")
  @post
  op forgotPassword(@body body: {
    email: string;
  }): {
    @statusCode statusCode: 200;
    @body body: StatusMessage;
  } | ValidationErrorResponse;

  @operationId("resetPassword")
  @route("/reset-password")
  @post
  op resetPassword(@body body: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): {
    @statusCode statusCode: 200;
    @body body: StatusMessage;
  } | ValidationErrorResponse;

  @operationId("resendEmailVerification")
  @doc("Resend the email verification notification to the authenticated user.")
  @route("/email/verification-notification")
  @post
  op resendEmailVerification(): AcceptedResponse | UnauthorizedResponse;
}

@tag("Identity")
namespace Identity {
  @operationId("getMe")
  @doc("Current authenticated identity with roles, permissions and verification state.")
  @route("/api/v1/me")
  @get
  op getMe(): {
    @statusCode statusCode: 200;
    @body body: Me;
  } | UnauthorizedResponse;
}

@tag("Infrastructure")
namespace Infrastructure {
  @operationId("getCsrfCookie")
  @doc("Issue the CSRF cookie required before state-changing requests.")
  @route("/sanctum/csrf-cookie")
  @get
  op getCsrfCookie(): NoContentResponse;
}

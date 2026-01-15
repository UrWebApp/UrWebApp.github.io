---
title: Who are you? A brief discussion on identity authentication methods
date: 2023-04-30 23:23:00
categories: Development
author: kai98k
tags:
  - Internet
  - Authorization
---

Identity authentication and information security issues have always been hot topics. Since Http itself is [Stateless](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview), every Request/Response is independent, so session, cookie, and token are needed for state/information management (stateful). There might also be many different applications, like using Redis, etc.

## Basic Authentication

The working principle of Basic Authentication is that when a client (such as a browser or app) sends a request to the server, it includes an Authorization field in the HTTP header, which contains the Base64 encoding of username and password. After receiving the request, the server decodes the username and password in the Authorization field and verifies if they are valid. If the username and password are valid, the server returns the requested data, otherwise it returns an error Response.

```
GET /secure-data HTTP/1.1
Host: example.com
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

In this example, the username is "username" and password is "password", and they are Base64 encoded as the value of the Authorization field. The server decodes this value and uses the plaintext username and password for verification.

Although Basic Authentication is very simple and easy to implement, it has some limitations. The most obvious limitation is that it transmits username and password in plaintext, making it vulnerable to eavesdropping and sniffing by attackers. In addition, Basic Authentication does not provide a mechanism for continued authorization after authentication, so it is not suitable for applications and APIs requiring higher security requirements. Therefore, it is generally not recommended to use Basic Authentication now, but rather to use more secure authentication methods.

## Session-based Authentication

> Just like ordering breakfast at a breakfast shop, the customer orally orders from the boss, the boss keys the meal and customer info into computer, and prints a number slip for the customer. When the customer picks up the meal, they need to give the number slip to the boss again. The customer is responsible for keeping the number slip, while the boss is responsible for managing data of each customer, and giving corresponding things to the customer according to the number slip.

When a user logs in on the client (frontend), they post account and password to the server. At this time, the backend program on the server creates a Session using user information and returns Session ID to the client. In subsequent Requests, this Session ID is carried in Http Cookie. Once the server finds Session ID upon receiving Session ID, it can find corresponding Session ID to retrieve user data stored in that Session.

### HTTP Cookie

HTTP cookie (web cookie, browser cookie) is a small piece of data sent from server to user browser. Browser may store and return cookie to the same server in next request, it remembers [Stateful info for Serverless HTTP protocol](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview).

Cookies are mainly used for three purposes:

1. Session Management
   Account login, shopping cart, game scores, or any other information server should remember

2. Personalization
   User settings, themes, and other settings

3. Tracking
   Record and analyze user behavior

None of the above three points should contain sensitive data, because users can arbitrarily tamper with Cookie values to deceive the server. What can be put is the ID corresponding to that data.

### Set-Cookie

Set-Cookie is an HTTP header used to pass a small block of data containing user Session and other state information between client (e.g., browser) and server. It usually stores data in user's browser Cookie on server side, so server can identify user and maintain Session state through Cookie.

| Set-Cookie    | Set Attribute                                             |
| ------------- | --------------------------------------------------------- |
| NAME=VALUE    | Name and value given to Cookie                            |
| expires=DATE  | Expiration date of Cookie, default is when browser closes |
| path=PATH     | File directory on server as Cookie object                 |
| domain=Domain | Domain name of Cookie object                              |
| Secure        | Send only when HTTPS                                      |
| HttpOnly      | Make Cookie inaccessible to Javascript                    |

### Disadvantages of Session Identity Authentication

1. Session Hijacking: If an attacker can obtain valid Session ID, they can impersonate the user to access and modify user data. Attackers may use some tricks, such as using fake websites on public Wi-Fi to steal Session ID.

2. CSRF Attack: Cross-Site Request Forgery (CSRF) attack is an attack that exploits victim's authentication permission on browser to complete some operations not expected by victim behind the scenes. Attackers may send forged requests to vulnerable websites in browser to access other protected websites behind the scenes using user's identity.

3. Unable to easily terminate user Session from server side: Because Session ID is usually stored in client Cookie, server has no way to directly terminate user Session. Even if server detects Session Hijacking or CSRF attack, it cannot directly interrupt Session, must wait for session to expire or reset user Session ID.

To reduce these risks, additional measures need to be taken, such as using HttpOnly and Secure flags, limiting Session duration, periodically resetting Session ID, etc.

### Cookie Same-Origin Policy

Cookie Same-Origin Policy is a security mechanism of browser used to restrict sharing Cookies between websites in browser. According to Same-Origin Policy, websites can only access Cookies with same protocol, host and port number as themselves. This prevents a website from accessing or modifying Cookies of other websites, thereby protecting user privacy and security.

For example, if website A tries to access Cookie of website B, browser will reject the request because their domain names are different. Similarly, if website A tries to write Cookie into website B's Cookie, it will also be rejected because their domain names are different.

## Token-Based Authentication

> Imagine ordering at a breakfast shop, you order with a string of jargon (Big warm slightly milk meat egg toast potato want pepper no tomato) to the boss. At this time the boss uses his super powerful brain to parse what meal this string of words needs, then when you pick up the meal you just need to say it again, and the boss will give you what you ordered.

When first encountering concept of Token, always couldn't understand why it is called "Token", until understanding the principle different from Basic Authentication is that, instead of simply converting plaintext into Base64 and sending to server, sensitive information is translated and encrypted into a set of meaningless information. At this time this set of meaningless information is called Token, and this behavior is called [Tokenization](<https://en.wikipedia.org/wiki/Tokenization_(data_security)>)

### Advantages

1. It can eliminate the need to save Session on server. In traditional Session-based authentication, server needs to save Session about user locally for use when user interacts with server. However, in Token-based authentication, all necessary user information is stored in Token.

2. It makes authentication across multiple servers or services easier. When user interacts between different servers or services, each service can verify user identity without sharing session or performing authentication between different services.

### JWT

When implementing Token-based authentication, a common method is to use JSON Web Token (JWT). JWT is an open standard that defines a format for securely transmitting information between different parties. JWT can contain user identity information, as well as other relevant information such as expiration time and permissions. After user passes authentication, application will return JWT to client, and client must carry JWT in every subsequent request for authentication on server side.

The structure of JWT contains three parts:

1. Header: Header part of JWT contains metadata about the token, such as token type, encryption algorithm etc.

2. Payload: Payload part of JWT contains information about user identity and other metadata in application, such as user ID, role, permissions etc.

3. Signature: Signature part of JWT is used to verify whether token is real and valid, ensuring it has not been modified or replaced during transmission.

JWT operation flow usually includes following steps:

1. User submits credentials (such as username and password) to application for authentication.
2. Application verifies user identity and creates a JWT based on user information.
3. User submits JWT in subsequent requests.
4. Application checks if JWT is valid, and uses information in JWT to verify user identity and authorization.
5. If JWT verification is successful, user is granted permission to access required resources.

JWT has many advantages, such as can be used across multiple platforms, no need to save state, high scalability and self-descriptiveness etc. In addition, JWT can also be used with OAuth to achieve secure authentication and authorization, further protecting user privacy and data security.

### OAuth

OAuth (Open Authorization) is an open standard authorization protocol used to authorize a user or application to access another user's resources without sharing user's password. OAuth protocol is usually used for secure authorization between web applications and services so that users can securely share their resources and information.

OAuth protocol uses a mechanism called "access token" to represent user identity and permissions. In OAuth authorization flow, when a user attempts to access a resource, they will be asked to authorize third-party application to access their resource. User can grant permission to application by logging into their account, so that application can use user's resource without knowing user's password.

OAuth protocol mainly includes following roles:

- User (resource owner): Owns resources that need authorized access.
- Third-party application (client): Application that needs to access user's resources.
- Authorization server: Server responsible for verifying user identity and granting tokens.
- Resource server: Server actually storing user resources.

The workflow of OAuth protocol is roughly as follows:

1. Third-party application sends request to authorization server, requesting authorization to access user's resources.
2. Authorization server verifies user identity and requests authorization from user.
3. User authorizes third-party application to access their resources.
4. Authorization server sends an access token to third-party application, representing that application is authorized to access user's resources.
5. Third-party application uses access token to access user's resources.

Through OAuth protocol, users can authorize third-party applications to access their resources without sharing their passwords. This helps protect security of user's sensitive information. At the same time, OAuth protocol can also help users control which applications can access their resources, thereby enhancing user's control over their own data.

There are multiple versions of OAuth protocol, including OAuth 1.0, OAuth 1.0a, OAuth 2.0 etc. Among them, OAuth 2.0 is the most commonly used version due to its simplicity, ease of use, high flexibility and strong scalability, and has become standard protocol for authentication and authorization between many web applications and services.

## Summary

Session authentication is usually based on cookie and session. When user logs in, server creates a session object and saves its unique identifier (session ID) in user's cookie. When user visits site again, browser automatically sends cookie to server side, server side checks if session ID is valid, and judges whether user is logged in based on information in session.

In contrast, JWT authentication is based on JSON Web Token (JWT). JWT is an open standard that allows secure transmission of information in network. In JWT authentication, after user logs in successfully, server creates a JSON object and encrypts it into a Token using key. Then sends Token to client, client can store it in cookie or use other ways to save. When user visits site again, client sends Token to server side, server side verifies it using key to determine user identity and permissions.

Overall, Session authentication usually requires maintaining session object on server side, consuming server resources, and cannot support cross-domain authentication well. While JWT authentication can be maintained on client side, can support cross-domain authentication, and has good scalability and security.

## Reference

https://squareball.co/blog/the-difference-between-basic-auth-and-oauth

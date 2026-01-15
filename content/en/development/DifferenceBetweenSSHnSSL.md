---
title: Is SSH more secure than SSL?
date: 2023-05-07
categories: Development
author: kai98k
authorsWords: In project business, there are many occasions where FTP is needed. Recently, a security unit required the use of SFTP. At first glance, I thought SFTP was FTPS, but after checking, I found that the underlying protocols are completely different. SFTP uses SSH, while FTPS uses SSL. So what is the difference between SSL and SSH?
tags:
  - Internet
---

## Difference between SSL and SSH

Both SSL and SSH are secure encryption communication protocols. In the OSI seven-layer model, both are established at the application layer, but their uses and application scenarios are different, although both are intended to make network transmission safer.

### SSL

SSL (Secure Sockets Layer) is an encryption protocol used for network security, which has now been replaced by its upgraded version TLS (Transport Layer Security). It is mainly used to protect secure network communication, such as secure website transmission (HTTPS), email, instant messaging, etc. In addition, websites using HTTPS can also get SEO bonus points. It usually uses port 443 on the server.

SSL uses algorithm encryption technology to protect sensitive data from being snooped or tampered with (man-in-the-middle attacks) during network transmission. SSL encryption technology mainly uses public key encryption and private key decryption, so that data can only be decrypted by the recipient during transmission.

Using SSL on a website can keep data encrypted during transmission between the user and the website, effectively preventing hackers from stealing and tempering with data. Nowadays, almost all websites use SSL to protect users' sensitive information, such as usernames, passwords, credit card information, etc.

#### SSL Sub-protocols

In SSL, there are several sub-protocols, including:

- **Handshake Protocol**: Used to establish a secure channel at the beginning of an SSL session. During the handshake process, the client and server verify each other's identity, exchange keys, and determine the algorithms used for encryption and decryption.

- **Change Cipher Spec Protocol**: Used to indicate to one party in the dialogue to start using new encryption and decryption algorithms. After the SSL session is established, once the client and server have determined the encryption and decryption algorithms, they can start using these algorithms for data encryption and decryption.

- **Certificate Verification Protocol**: Used to verify digital certificates at the beginning of an SSL session. Digital certificates are used to prove the identity of the server and ensure the security of data transmission.

- **Certificate Data Protocol**: Used to transmit digital certificates during an SSL session. Digital certificates include digital signatures, public keys, and other metadata used to prove the identity of the server and establish a secure channel.

These sub-protocols are designed to effectively prevent man-in-the-middle attacks. In addition, to establish a server with SSL transmission protocol, you need to place an SSL Certificate on the server.

#### SSL Certificate

An SSL (Secure Socket Layer) certificate is a digital certificate issued by a trusted third-party organization (such as Comodo, Symantec, DigiCert, etc.) used to verify the identity of a website and ensure the security of transmitted data. SSL certificates usually identify the website's public key, digital signature, and other metadata, which can prove the website's true identity and security.

When a browser visits a website using an SSL certificate, the browser sends a request to the website's server, and the server sends its SSL certificate to the browser for verification. The browser checks the validity, issuer, validity period, and other information of the SSL certificate, and uses the public key in the certificate to encrypt the transmitted data. This ensures that the transmitted data will not be stolen or tampered with.

### SSH

Secure Shell Protocol (SSH) is an encrypted network transmission protocol used for secure data communication and remote login in insecure networks. It is typically used to manage and remotely control computer systems running on remote servers, and can also be used to securely transmit data, such as file and database backups. It usually uses port 22.

The SSH protocol protects the security of data transmission by establishing a secure encrypted channel, making it impossible for attackers to snoop or steal communication content. It uses public key encryption and private key decryption to encrypt and decrypt data, ensuring that data transmitted over the network is not stolen or tampered with.

In SSH, each user has a pair of keys, including a public key and a private key. When a user needs to log in to a remote server, they first send the public key to the server, and then the server matches the user's public key with its own private key to confirm the user's identity. Once the user passes verification, a secure SSH connection can be established, and secure data transmission and remote operations can be performed.

### Summary: SSH vs SSL, which is more secure?

SSL (Secure Socket Layer) and SSH (Secure Shell) are both protocols used to ensure network security, but they have different uses and characteristics, so it is impossible to directly compare which is more secure, but primarily both are intended to prevent man-in-the-middle attacks.

SSL is mainly used to protect data transmitted over the network, commonly used to encrypt communication between browsers and websites, preventing sensitive information from being intercepted and stolen. SSL typically uses X.509 certificates to verify the identity of the website and uses symmetric encryption and asymmetric encryption to encrypt data. SSL is a TCP/IP-based protocol that achieves secure transmission by adding a layer of security between the transport layer and the application layer.

SSH is a secure protocol used for encrypting network communication and executing remote commands. SSH can establish a secure encrypted channel between the client and server to prevent third-party eavesdropping and man-in-the-middle attacks. SSH typically uses asymmetric encryption to determine the identity of both parties and uses symmetric encryption to encrypt data. SSH is very useful in many scenarios, such as remote server management, file transmission, and secure proxies.

Therefore, both SSL and SSH have their specific uses and advantages, and both can provide security protection. The specific protocol to use depends on the application scenario and requirements. In short, SSL is like the security guarantee of the cargo, while SSH is like the security guarantee of the freight transport channel.

| Spec         | SSL                                                              | SSH                                                                          |
| ------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Full Form    | Secure Socket Layer                                              | Secure Shell                                                                 |
| Port         | 443                                                              | 22                                                                           |
| Function     | Commonly used to encrypt communication between client and server | Commonly used to encrypt communication channels between two remote computers |
| Auth         | Public and private key pairing                                   | Public and private key pairing or account password pairing                   |
| Common Cases | E-commerce, banking, etc.                                        | Data transmission inside and outside organization                            |
| Principle    | Digital Certificate                                              | Encrypted Channel                                                            |

## Reference

- [SSH vs SSL: What’s the Difference?](https://kinsta.com/knowledgebase/ssh-vs-ssl/)
- [SSL vs SSH Difference](https://zhuanlan.zhihu.com/p/138679729)

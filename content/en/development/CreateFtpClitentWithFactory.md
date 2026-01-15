---
title: Apply Factory Method to Design FtpClient
date: 2023-07-07
categories: Development
author: kai98k
authorsWords: With the increasing diversity of network protocols, if every time there is a new security protocol, you have to write a special class for this protocol, and more and more classes, if there is no interface specification, it is easy to have "you in me, me in you", and I can't use you, you can use me (?), that is, high coupling, low cohesion. At this time, you can use the factory method to reuse a single component, and will not change A and affect B.
tags:
  - .Net
---

## Factory Method

![Factory Method](https://hackmd.io/_uploads/B1-Otf8Vh.png)

Factory Method is a common design pattern, belonging to one of the object-oriented design patterns. It provides an interface for creating objects, but the creation of specific objects is implemented by subclasses. The factory method pattern allows a class to defer object instantiation to subclasses.

The main purpose of the factory method pattern is to decouple the creation and use of objects, so that new object classes can be easily introduced without modifying existing code. It provides a flexible way to create objects and allows determining the specific class to instantiate at runtime as needed.

In the factory method pattern, there is usually an abstract factory class that defines an interface for creating objects, but no concrete implementation. The subclass will implement the factory class as needed and override the factory method to create specific objects.

#### C# Code Example

The example here will be a little different from the picture above, mainly whether the factory needs to inherit an interface to implement. Basically, different products will definitely have interfaces to regulate, but when there is only one factory, it depends on the situation whether an interface is needed.

1. First, define the abstract interface IProduct, which contains the common operation methods of the object:

```csharp=
public interface IProduct
{
    void Operation();
}
```

2. Next, implement the concrete product classes ConcreteProductA and ConcreteProductB, which implement the methods of the IProduct interface respectively:

```csharp=
public class ConcreteProductA : IProduct
{
    public void Operation()
    {
        Console.WriteLine("Operation of ConcreteProductA");
    }
}

public class ConcreteProductB : IProduct
{
    public void Operation()
    {
        Console.WriteLine("Operation of ConcreteProductB");
    }
}
```

3. Next, define the abstract factory interface IFactory, which contains the abstract method for creating objects:

```csharp=
public interface IFactory
{
    IProduct CreateProduct();
}
```

4. Then, implement the specific factory classes ConcreteFactoryA and ConcreteFactoryB, which implement the methods of the IFactory interface respectively:

```csharp=
public class ConcreteFactoryA : IFactory
{
    public IProduct CreateProduct()
    {
        return new ConcreteProductA();
    }
}

public class ConcreteFactoryB : IFactory
{
    public IProduct CreateProduct()
    {
        return new ConcreteProductB();
    }
}
```

5. Finally, use the factory method pattern to create objects:

```csharp=
public class Client
{
    public static void Main()
    {
        IFactory factoryA = new ConcreteFactoryA();
        IProduct productA = factoryA.CreateProduct();
        productA.Operation();

        IFactory factoryB = new ConcreteFactoryB();
        IProduct productB = factoryB.CreateProduct();
        productB.Operation();
    }
}
```

In the above example, ConcreteFactoryA is used to create the ConcreteProductA object, and ConcreteFactoryB is used to create the ConcreteProductB object. In this way, different product objects can be created according to different factory classes, and their operation methods can be called.

## FtpClient

Next, we will apply the factory method to produce different SFTP, FTP FtpClients. Here we will omit the implementation of the FileInfo class. Ordinary Ftp/Ftps will reference the FluentFTP package, while SFTP will reference SSH.NET, but the final Client operation methods will be the same.

1. First, create IFtpClient, with a common interface to regulate operation methods:

```csharp=
 public interface IFtpClient
    {
        IFtpClient SetHost(string host, int port, string userName, string password);

        bool AutoDisconnect { get; set; }

        bool IsConnected { get; }

        void Connect();

        Task ConnectAsync();

        void Disconnect();

        Task DisconnectAsync();

        IEnumerable<FileInfo> GetListing(string path);

        Task<IEnumerable<FileInfo>> GetListingAsync(string path);

        void Download(string localPath, string remotePath);

        Task DownloadAsync(string localPath, string remotePath);

        void DeleteFile(string path);

    }
```

2. Create normal FtpClient inheriting the interface, and implement methods (omitting most implementation details)

```csharp=
 public class FtpClient : IFtpClient
    {
        private FluentFTP.IFtpClient _client;

        public FtpClient()
        {

        }

        public FtpClient(string host, string userName, string password)
        {
            _client = new FluentFTP.FtpClient(host, userName, password);
        }

        public FtpClient(string host, int port, string userName, string password)
        {
            _client = new FluentFTP.FtpClient(host, port, userName, password);
        }

        public IFtpClient SetHost(string host, int port, string userName, string password)
        {
            _client = new FluentFTP.FtpClient(host, port, userName, password);

            return this;
        }

        public bool AutoDisconnect { get; set; } = true;

        public bool IsConnected
        {
            get
            {
                if (_client == null)
                {
                    return false;
                }

                return _client.IsConnected;
            }
        }

        public void Connect()
        {
            if (_client.IsConnected) { return; }

            _client.AutoConnect();
        }
        public void Disconnect()
        {
            if (!_client.IsConnected) { return; }

            _client.Disconnect();
        }

        public async Task DeleteFileAsync(string path)
        {
            try
            {
                Connect();

                await _client.DeleteFileAsync(path);
            }
            finally
            {
                if (AutoDisconnect)
                {
                    Disconnect();
                }
            }
        }
        //.............
       /*...omitting implementation...*/
    }
```

3. Create SftpClient inheriting the interface, and implement methods (omitting most implementation details):

```csharp=
public class SftpClient : IFtpClient
    {
        private Renci.SshNet.SftpClient _client;

        public SftpClient()
        {

        }

        public SftpClient(string host, int port, string userName, string password)
        {
            var kauth = new KeyboardInteractiveAuthenticationMethod(userName);
            var pauth = new PasswordAuthenticationMethod(userName, password);
            kauth.AuthenticationPrompt += new EventHandler<Renci.SshNet.Common.AuthenticationPromptEventArgs>(HandleKeyEvent);
            var connectionInfo = new ConnectionInfo(host, port, userName, pauth, kauth);

            _client = new Renci.SshNet.SftpClient(connectionInfo);

            void HandleKeyEvent(Object sender, Renci.SshNet.Common.AuthenticationPromptEventArgs e)
            {
                foreach (Renci.SshNet.Common.AuthenticationPrompt prompt in e.Prompts)
                {
                    if (prompt.Request.IndexOf("Password:", StringComparison.InvariantCultureIgnoreCase) != -1)
                    {
                        prompt.Response = password;
                    }
                }
            }
        }

        public bool AutoDisconnect { get; set; } = true;

        public bool IsConnected
        {
            get
            {
                if (_client == null)
                {
                    return false;
                }

                return _client.IsConnected;
            }
        }

        public void Connect()
        {
            if (_client.IsConnected) { return; }

            _client.Connect();
        }

        public void Download(string localPath, string remotePath)
        {
            try
            {
                Connect();

                if (File.Exists(localPath))
                {
                    File.Delete(localPath);
                }

                using (var fileStream = File.Create(localPath))
                {
                    _client.DownloadFile(remotePath, fileStream);
                }
            }
            finally
            {
                if (AutoDisconnect)
                {
                    Disconnect();
                }
            }
        }

        public void DeleteFile(string path)
        {
            try
            {
                Connect();

                _client.DeleteFile(path);
            }
            finally
            {
                if (AutoDisconnect)
                {
                    Disconnect();
                }
            }
        }

        /*...omitting...*/
    }
```

4. Create factory to generate Client:

```csharp=
public class FtpFactory
    {

        public FtpFactory()
        {

        }
        /// <summary>
        /// use protocol to select the proper FtpClient
        /// </summary>
        /// <param name="host">IP Address</param>
        /// <param name="port"></param>
        /// <param name="userName"></param>
        /// <param name="password"></param>
        /// <param name="protocol"></param>
        public IFtpClient CreateClient(string host, int port, string userName, string password, FtpProtocols protocol = FtpProtocols.SFTP)
        {

            if (protocol == FtpProtocols.SFTP)
            {
                return new SftpClient(host, port, userName, password);
            }
            return new FtpClient(host, port, userName, password);
        }
    }
    public enum FtpProtocols
    {
        FTP = 0,
        FTPS = 1,
        SFTP = 2,
    }
```

5. Use Factory:

```csharp=
  public FtpFactoryTest(IConfiguration configuration)
        {
            _configuration = configuration;
            var _ftpIP = _configuration.GetValue<string>("FTPInfo:IP");
            var _ftpUserName = _configuration.GetValue<string>("FTPInfo:UserName");
            var _ftpPassword = _configuration.GetValue<string>("FTPInfo:Password");
            var _Port = _configuration.GetValue<int>("FTPInfo:Port");
            var _Protocol = configuration.GetValue<FtpProtocols>("FTPInfo:Protocol");
            _ftpClient = new FtpFactory().CreateClient(_ftpIP, _Port, _ftpUserName, _ftpPassword, _Protocol);
            _fileLocation = _configuration.GetValue<string>("FileLocation");
        }
```

Using the factory method design pattern enables flexible creation of objects, decouples object creation from usage, and also facilitates code extension and maintenance.

## Reference

- [Abstract Factory Pattern](https://ithelp.ithome.com.tw/articles/10239444)

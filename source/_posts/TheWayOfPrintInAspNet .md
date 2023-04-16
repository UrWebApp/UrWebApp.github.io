---
title: 幾種 .Net 列印的方式
date: 2023-02/05 15:00
categories: Back-End
author: Kai98k
tags:
- .Net
- PDF
---
通常印表機可以傳送 ZPL 或是直接透過驅動程式來觸發列印程序，本文主要講的是後者的列印方式。

## 安裝驅動

我們要先讓電腦認識印表機及溝通的埠道，可至 [BarTender](https://www.seagullscientific.com/tw/support/downloads/drivers/) 安裝相對應的驅動。

1. 下載完後選擇連接方式

![](https://i.imgur.com/IjBDcBJ.png)

2. 指定印表機型號

![](https://i.imgur.com/u5o7UKI.png)

3. 假設印表機是透過網路方式連接，須至設定增加 IP 埠道

![](https://i.imgur.com/cSunWhn.png)
![](https://i.imgur.com/6upmKAf.png)
![](https://i.imgur.com/aaC4fTz.png)


## 程式實作

### PrintDocument 與 Process

PrintDocument 類別是 .Net Framework 內建的套件，好處是可以在設定與操作輸出傳送至印表機的物件，可搭配 Process 利用指令列印。

>注意: 當專案部屬在非 Windows 環境中無法作用，其實就是最好只在 .Net Framework 專案中使用。


#### 使用指令列印

這邊要使用 `Print` Verb 時，要先至 Regedit，查看電腦是否有登入此指令

![](https://i.imgur.com/DdhyIbi.png)

![](https://i.imgur.com/Z5X7uF7.png)

如果沒有的話，通常是沒有安裝 [Acrobat Reader](https://get.adobe.com/tw/reader/)，此 PDF 閱讀軟體會自動在電腦上登錄列印紙令，如有此指令便可實作程式碼。

```csharp
private void Print(string pdfPath)
{
   PrintDocument pd = new PrintDocument();

   pd.DefaultPageSettings.PrinterSettings.Copies = 2; // 印幾份
   pd.DefaultPageSettings.PrinterSettings.PrinterName = @"印表機名稱"; 
    
    // 新增指令
   Process ps = new Process(); 
   ProcessStartInfo startInfo = new ProcessStartInfo();
   startInfo.UseShellExecute = true;
   startInfo.Verb = "Print";
   startInfo.CreateNoWindow = true;
   startInfo.WindowStyle = ProcessWindowStyle.Hidden;
   startInfo.Arguments = @"/p /h \" + pdfPath + "\" \"" + pd.PrinterSettings.PrinterName + " \"";

   startInfo.FileName = pdfPath;
   ps.StartInfo = startInfo;

   ps.Start(); // 執行指令
   ps.WaitForExit();
   ps.Dispose();
            
}
```

---
#### 純 PrintDocument
```csharp=
using System;
using System.Drawing;
using System.Drawing.Printing;
using System.Windows.Forms;
 
namespace PrintTest
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }
 
        private void button1_Click(object sender, EventArgs e)
        {
            streamToPrint = new StreamReader
               (@"C:\\My Documents\\MyFile.txt");
               
            //創建列印物件實體
            PrintDocument printDocument = new PrintDocument();
            // 選擇印表機
            printDocument.DefaultPageSettings.PrinterSettings.PrinterName = @"印表機名稱";
            //設定列印用的紙張，可以定義紙張的大小
            printDocument.DefaultPageSettings.PaperSize = new PaperSize("Custom", 500, 500);
            //註冊PrintPage事件，列印每一頁時會觸發
            printDocument.PrintPage += new PrintPageEventHandler(this.PrintDocument_PrintPage);
            // 開始列印
            printDocument.Print();
            streamToPrint.Close();
        }
        private void PrintDocument_PrintPage(object sender, System.Drawing.Printing.PrintPageEventArgs e)
        {
            //設置列印内容及其字體，顏色和位置
            e.Graphics.DrawString("Hello World！", new Font(new FontFamily("Arial"), 24), System.Drawing.Brushes.Red, 50, 50);
            
            // 每行都印
              while (count < linesPerPage &&
           ((line = streamToPrint.ReadLine()) != null))
        {
            yPos = topMargin + (count *
               printFont.GetHeight(e.Graphics));
            e.Graphics.DrawString(line, printFont, Brushes.Black,
               leftMargin, yPos, new StringFormat());
            count++;
        }
        }
    }
}
```

### FreeSpire.Pdf

<https://www.gushiciku.cn/pl/2N0Y/zh-tw>
FreeSpire.Pdf 需使用 Nuget 或指令安裝
>免費社群版本印超過十頁時會報錯，也許你可以寫個每印九頁...

1. 使用預設印表機列印所有頁面
```csharp=
PdfDocument pd = new PdfDocument();
pd.LoadFromFile(@"C:\File\testPdf.pdf")
pd.Print();
```
2. 指定印表機，設定文件列印範圍
```csharp=
PdfDocument pd = new PdfDocument();
pd.LoadFromFile(@"C:\File\testPdf.pdf")
// 指定印表機
pd.PrintSettings.PrinterName = "印表機名稱";
// 設定列印頁碼範圍，2~6 頁
pd.PrintSettings.SelectPageRange(2,6);
// or 設定列印不連續的頁面
pd.PrintSettings.SelectSomePages(new int[]{2,4,6,8});
pd.Print();
```
3. 黑白雙面多份列印
```csharp=
PdfDocument pd = new PdfDocument();
pd.LoadFromFile(@"C:\File\testPdf.pdf")
// 黑白列印
pd.PrintSettings.Color = false;
// 設定多份
pd.PrintSettings.Copies = 3;
//判斷印表機是否支援雙面列印
if (pd.PrintSettings.CanDuplex)
{
     //如果支援則設定雙面列印模式，可選：Default/Simplex/Horizontal/Vertical
     pd.PrintSettings.Duplex = Duplex . Default ;
}
pd.Print();
```

### PdfiumViewer 
可參考[官方文件](https://github.com/pvginkel/PdfiumBuild)安裝，因為套件作者已沒在維護，所以在 Nuget 中安裝 PdfiumViewer 以外，還需要安裝 pdfiumViewer.Native.x86_64.v8-xfa，這邊推薦安裝 2.10.0 的 PdfiumViewer，安裝完後，專案中會出現 x64 資料夾。

![](https://i.imgur.com/aMo9UrL.png)

``` csharp=
var pdfPath = @"資料位置" 
try
            {
                using (var document = PdfDocument.Load(pdfPath))
                {
                    using (var printDocument = document.CreatePrintDocument())
                    {
                        printDocument.PrinterSettings.PrintFileName = "testPdf.pdf";
                        printDocument.PrinterSettings.PrinterName = @"印標機名稱";
                        printDocument.DocumentName = "file.pdf";
                        printDocument.PrinterSettings.PrintFileName = "file.pdf";
                        printDocument.PrintController = new StandardPrintController();
                        printDocument.Print();
                    }
                }
                return "success";
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
```


## Reference
* [PrintDocument](https://learn.microsoft.com/zh-tw/dotnet/api/system.drawing.printing.printdocument?view=dotnet-plat-ext-7.0)
* [7 Ways to Print PDF in a .NET Application](https://medium.com/@alexaae9/7-ways-to-print-pdf-in-a-net-application-ab15905bb98f)
* [使用預設印表機列印pdf文件](https://dotblogs.com.tw/whd/2016/03/22/234526)
* [使用 C# 批次列印 PDF 檔案](https://blog.darkthread.net/blog/print-pdf-with-c)
* [C# 列印PDF文件的10種方法](https://www.gushiciku.cn/pl/2N0Y/zh-tw)
* [C# - How to programmatically print an existing PDF file using PrintDocument](https://stackoverflow.com/questions/47857500/c-sharp-how-to-programmatically-print-an-existing-pdf-file-using-printdocument)
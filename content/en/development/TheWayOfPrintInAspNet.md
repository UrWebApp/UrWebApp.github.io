---
title: Several ways to Print in .Net
date: 2023-02-05 15:00
categories: Development
author: kai98k
tags:
  - .Net
  - PDF
---

Usually printers can transmit ZPL or trigger print process directly via driver. This article mainly talks about the latter printing method.

## Install Driver

We need to let the computer recognize printer and communication port first, can go to [BarTender](https://www.seagullscientific.com/tw/support/downloads/drivers/) to install corresponding driver.

1. Select connection method after download

![Step 1](https://i.imgur.com/IjBDcBJ.png)

2. Specify printer model

![Step 2](https://i.imgur.com/u5o7UKI.png)

3. Assuming printer is connected via network, need to add IP port in settings

![Step 3](https://i.imgur.com/cSunWhn.png)
![Step 3-2](https://i.imgur.com/6upmKAf.png)
![Step 3-3](https://i.imgur.com/aaC4fTz.png)

## Program Implementation

### PrintDocument and Process

PrintDocument class is a built-in package of .Net Framework. The advantage is that it can configure and operate object output sent to printer, can be paired with Process to print using command.

> Note: When project is deployed in non-Windows environment it cannot work, basically it is best to use only in .Net Framework projects.

#### Print using Command

Here when using `Print` Verb, need to go to Regedit first to see if computer has registered this command.

![Step 1](https://i.imgur.com/DdhyIbi.png)

![Step 2](https://i.imgur.com/Z5X7uF7.png)

If not, usually [Acrobat Reader](https://get.adobe.com/tw/reader/) is not installed. This PDF reading software will automatically register print command on computer. If this command exists, code can be implemented.

```csharp
private void Print(string pdfPath)
{
   PrintDocument pd = new PrintDocument();

   pd.DefaultPageSettings.PrinterSettings.Copies = 2; // How many copies
   pd.DefaultPageSettings.PrinterSettings.PrinterName = @"Printer Name";

    // Add command
   Process ps = new Process();
   ProcessStartInfo startInfo = new ProcessStartInfo();
   startInfo.UseShellExecute = true;
   startInfo.Verb = "Print";
   startInfo.CreateNoWindow = true;
   startInfo.WindowStyle = ProcessWindowStyle.Hidden;
   startInfo.Arguments = @"/p /h \" + pdfPath + "\" \"" + pd.PrinterSettings.PrinterName + " \"";

   startInfo.FileName = pdfPath;
   ps.StartInfo = startInfo;

   ps.Start(); // Execute command
   ps.WaitForExit();
   ps.Dispose();

}
```

---

#### Pure PrintDocument

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

            //Create print object instance
            PrintDocument printDocument = new PrintDocument();
            // Select printer
            printDocument.DefaultPageSettings.PrinterSettings.PrinterName = @"Printer Name";
            //Set paper for printing, can define paper size
            printDocument.DefaultPageSettings.PaperSize = new PaperSize("Custom", 500, 500);
            //Register PrintPage event, triggered when printing each page
            printDocument.PrintPage += new PrintPageEventHandler(this.PrintDocument_PrintPage);
            // Start printing
            printDocument.Print();
            streamToPrint.Close();
        }
        private void PrintDocument_PrintPage(object sender, System.Drawing.Printing.PrintPageEventArgs e)
        {
            //Set print content and its font, color and position
            e.Graphics.DrawString("Hello World！", new Font(new FontFamily("Arial"), 24), System.Drawing.Brushes.Red, 50, 50);

            // Print every line
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
FreeSpire.Pdf needs to be installed using Nuget or command

> Free community version will report error when printing more than ten pages, maybe you can write a loop to print every nine pages...

1. Print all pages using default printer

```csharp=
PdfDocument pd = new PdfDocument();
pd.LoadFromFile(@"C:\File\testPdf.pdf")
pd.Print();
```

2. Specify printer, set document print range

```csharp=
PdfDocument pd = new PdfDocument();
pd.LoadFromFile(@"C:\File\testPdf.pdf")
// Specify printer
pd.PrintSettings.PrinterName = "Printer Name";
// Set print page range, pages 2~6
pd.PrintSettings.SelectPageRange(2,6);
// or Set discontinuous pages to print
pd.PrintSettings.SelectSomePages(new int[]{2,4,6,8});
pd.Print();
```

3. Black and white double-sided multi-copy printing

```csharp=
PdfDocument pd = new PdfDocument();
pd.LoadFromFile(@"C:\File\testPdf.pdf")
// Black and white printing
pd.PrintSettings.Color = false;
// Set multiple copies
pd.PrintSettings.Copies = 3;
//Judge if printer supports double-sided printing
if (pd.PrintSettings.CanDuplex)
{
     //If supported set double-sided print mode, options: Default/Simplex/Horizontal/Vertical
     pd.PrintSettings.Duplex = Duplex . Default ;
}
pd.Print();
```

### PdfiumViewer

Can refer to [Official Documentation](https://github.com/pvginkel/PdfiumBuild) to install, because package author is not maintaining it anymore, so besides installing PdfiumViewer in Nuget, need to install pdfiumViewer.Native.x86_64.v8-xfa as well. Here recommend installing 2.10.0 PdfiumViewer. After installation, x64 folder will appear in project.

![PdfiumViewer](https://i.imgur.com/aMo9UrL.png)

```csharp=
var pdfPath = @"Data Location"
try
            {
                using (var document = PdfDocument.Load(pdfPath))
                {
                    using (var printDocument = document.CreatePrintDocument())
                    {
                        printDocument.PrinterSettings.PrintFileName = "testPdf.pdf";
                        printDocument.PrinterSettings.PrinterName = @"Printer Name";
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

- [PrintDocument](https://learn.microsoft.com/zh-tw/dotnet/api/system.drawing.printing.printdocument?view=dotnet-plat-ext-7.0)
- [7 Ways to Print PDF in a .NET Application](https://medium.com/@alexaae9/7-ways-to-print-pdf-in-a-net-application-ab15905bb98f)
- [Print pdf file using default printer](https://dotblogs.com.tw/whd/2016/03/22/234526)
- [Batch print PDF files using C#](https://blog.darkthread.net/blog/print-pdf-with-c)
- [10 ways to print PDF files in C#](https://www.gushiciku.cn/pl/2N0Y/zh-tw)
- [C# - How to programmatically print an existing PDF file using PrintDocument](https://stackoverflow.com/questions/47857500/c-sharp-how-to-programmatically-print-an-existing-pdf-file-using-printdocument)

# Docs

### Step 1: Install usbipd on windows

Run this command in administrator command line.
`winget install --interactive --exact dorssel.usbipd-win`

### Step 2: Attach the Printer to WSL

Before running your Node.js script, the printer must be "passed through" from Windows to Ubuntu.

1. **On Windows (PowerShell as Admin):**
* Find your printer: `usbipd list`
* Bind it (first time only): `usbipd bind --busid <BUSID>`
* Attach it to WSL: `usbipd attach --wsl --busid <BUSID>`


2. **On Ubuntu:**
* Verify it’s there: `lsusb` (You should see your printer manufacturer listed).

If `lsusb` not working, Install Linux Tools (Ubuntu)
Inside your WSL 2 Ubuntu terminal, you need the client tools to receive the USB signal from Windows.

Open your Ubuntu terminal.
Run these commands to install the required packages:

```bash
sudo apt update
sudo apt install linux-tools-generic hwdata
sudo update-alternatives --install /usr/local/bin/usbip usbip /usr/lib/linux-tools/*-generic/usbip 20
```


---

### Step 3: Set Permissions

By default, Ubuntu restricts USB access. You need to give your user permission to talk to the printer, or you'll get an "Access Denied" error in Node.js.

```bash
# Add your user to the dialout and lp groups
sudo usermod -a -G dialout $USER
sudo usermod -a -G lp $USER

# Reload groups (or just restart your WSL terminal)
newgrp dialout

```

---

### Step 4: The Printing Script

The app uses the `escpos` library. 

### Step 5: Run the App

```bash
npm start
```

### Pro-Tips for WSL 2

* **Automatic Attachment:** Every time you unplug the printer or restart Windows, the `usbipd attach` command must be run again.
* **Identify by VID/PID:** If the script doesn't find the printer automatically, run `lsusb` in Ubuntu. You'll see something like `Bus 001 Device 003: ID 04b8:0202 Seiko Epson Corp.`
* In your code, change it to: `const device = new escpos.USB(0x04b8, 0x0202);`



## "Auto-Attach" batch script
`usbipd` connections usually drop whenever you unplug the printer or your computer goes to sleep. Manually typing the BusID every time gets old very quickly.

Since the **BusID** (like `2-1`) can sometimes change if you plug the printer into a different USB port, it is better to write a script that finds the printer by its **Hardware Name**.

### The "Auto-Attach" Batch Script

1. Open **Notepad**.
2. Paste the code below.
3. **Change `Thermal Printer**` in the second line to match part of the name you see when you run `usbipd list`.
4. Save the file as `attach_printer.bat` (make sure it doesn't end in `.txt`).

```batch
@echo off
:: SET YOUR PRINTER NAME FRAGMENT HERE
set "PRINTER_NAME=Thermal Printer"

echo Searching for %PRINTER_NAME%...

:: Find the BusID dynamically
for /f "tokens=1" %%a in ('usbipd list ^| findstr /i "%PRINTER_NAME%"') do set BUSID=%%a

if "%BUSID%"=="" (
    echo [ERROR] Printer not found. Make sure it is plugged in and recognized by Windows.
    pause
    exit /b
)

echo Found Printer at BusID: %BUSID%
echo Binding device...
usbipd bind --busid %BUSID% 2>nul

echo Attaching to WSL...
usbipd attach --wsl --busid %BUSID%

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Printer is now available in Ubuntu!
) else (
    echo [FAILED] Could not attach. Ensure WSL is running.
)

pause

```

---

### How to use it

1. **Right-click** the `attach_printer.bat` file.
2. Select **Run as Administrator** (this is required for `usbipd` to bind hardware).
3. The script will automatically find the ID, bind it, and send it to Ubuntu.

---

### One final check in Ubuntu

Once you run that script, your Node.js app still needs to know *which* USB device to talk to. Run this command in your Ubuntu terminal:

```bash
lsusb

```

Look for a line like this:
`Bus 001 Device 003: ID 04b8:0202 Seiko Epson Corp.`

In your **Node.js code**, make sure you use those specific hex numbers (Vendor ID and Product ID) so the app doesn't try to print to your keyboard or mouse:

```javascript
// Replace 0x04b8 and 0x0202 with the IDs from your lsusb output
const device = new escpos.USB(0x04b8, 0x0202); 

```
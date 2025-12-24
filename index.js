const { Printer, CustomCharacter } = require('@node-escpos/core');
const USB = require('@node-escpos/usb-adapter');

/**
 * 1. Find your VID/PID by running 'lsusb' in your Ubuntu terminal.
 * Example output: Bus 001 Device 003: ID 04b8:0202 Seiko Epson...
 * Here, VID is 0x04b8 and PID is 0x0202.
 */
const vid = 0x04b8; // Replace with your VID
const pid = 0x0202; // Replace with your PID

const device = new USB(vid, pid);
const printer = new Printer(device);

device.open(async function (error) {
  if (error) {
    console.error("CRITICAL: Could not open printer. Check usbipd attach status and udev rules.");
    console.error(error);
    return;
  }

  try {
    await printer
      .font('a')
      .align('ct')
      .style('bu')
      .size(1, 1)
      .text('WSL PRINT TERMINAL')
      .size(0, 0)
      .style('normal')
      .text('--------------------------------')
      .feed(1)
      .align('lt')
      .text('Qty  Item                Price')
      .text('1    Node.js Coffee      $4.50')
      .text('1    WSL2 Integration    $0.00')
      .feed(1)
      .align('ct')
      .text('TOTAL: $4.50')
      .feed(2)
      // Note: Barcode support varies by printer model
      // .barcode('987654321', 'CODE39') 
      .feed(2)
      .cut()
      .close();
      
    console.log("Print job sent successfully!");
  } catch (err) {
    console.error("Print Error:", err);
  }
});
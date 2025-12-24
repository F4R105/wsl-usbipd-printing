const escpos = require('escpos');
escpos.USB = require('escpos-usb');

// Find your printer
const device = new escpos.USB(); 
// Note: If you have multiple USB devices, use: new escpos.USB(vid, pid)
const printer = new escpos.Printer(device);

device.open(function(error) {
  if (error) {
    console.error("Error opening device:", error);
    return;
  }

  printer
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
    .barcode('987654321', 'CODE39') // Optional: Barcode
    .feed(2)
    .cut()
    .close();
});
document.getElementById('save-contact').addEventListener('click', async function() {
  const contact = {
    name: 'Jackies Cleaning Services',
    business: 'Jackies Cleaning Services',
    mobile: '+27723747478', // Removed spaces for better compatibility
    email: 'info@jackies.co.za',
    website: 'https://jackies.co.za'
  };

  // Create vCard content
  const vCardContent = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.name}`,
    `ORG:${contact.business}`,
    `TEL;TYPE=CELL:${contact.mobile}`,
    `EMAIL:${contact.email}`,
    `URL:${contact.website}`,
    'END:VCARD'
  ].join('\n');

  // 1. First try Web Share API with file (works on many mobile browsers)
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [] })) {
    try {
      const blob = new Blob([vCardContent], { type: 'text/vcard' });
      const file = new File([blob], `${contact.name.replace(/\s/g, '_')}.vcf`, {
        type: 'text/vcard'
      });
      
      await navigator.share({
        title: 'Add to Contacts',
        text: `Add ${contact.name} to your contacts`,
        files: [file]
      });
      return;
    } catch (e) {
      console.log('Web Share failed, falling back');
    }
  }

  // 2. Try Android intent (may open contacts app directly)
  if (/android/i.test(navigator.userAgent)) {
    try {
      const intentUrl = `intent://add_contact#Intent;scheme=content;type=text/x-vcard;S.file_name=${encodeURIComponent(contact.name)}.vcf;end`;
      window.location.href = intentUrl;
      
      // Fallback after short delay if intent fails
      setTimeout(() => {
        downloadVCardWithInstructions(vCardContent, contact);
      }, 300);
      return;
    } catch (e) {
      console.log('Android intent failed');
    }
  }

  // 3. Final fallback - download with instructions
  downloadVCardWithInstructions(vCardContent, contact);
});

function downloadVCardWithInstructions(vCardContent, contact) {
  try {
    // Create download
    const blob = new Blob([vCardContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contact.name.replace(/\s/g, '_')}.vcf`;
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    // Platform-specific instructions
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      alert('1. Tap the share icon (box with arrow)\n2. Scroll and select "Add to Contacts"');
    } else if (/Android/i.test(navigator.userAgent)) {
      alert('1. Open your Downloads folder\n2. Tap the .vcf file\n3. Select "Add to Contacts"');
    } else {
      alert('Contact file downloaded. Open it to add to your address book');
    }
  } catch (e) {
    // Ultimate fallback - show contact details
    showManualContactInstructions(contact);
  }
}

function showManualContactInstructions(contact) {
  const details = [
    `Name: ${contact.name}`,
    `Business: ${contact.business}`,
    `Phone: ${contact.mobile}`,
    `Email: ${contact.email}`,
    `Website: ${contact.website}`
  ].join('\n\n');

  if (navigator.clipboard) {
    if (confirm('Copy contact details to clipboard?')) {
      navigator.clipboard.writeText(details)
        .then(() => alert('Details copied! Open your contacts app to paste them'))
        .catch(() => alert(details));
    } else {
      alert(details);
    }
  } else {
    alert(details);
  }
}


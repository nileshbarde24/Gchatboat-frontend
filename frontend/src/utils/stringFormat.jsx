export function truncateString(inputString, maxLength) {
  if (inputString.length > maxLength) {
    return inputString.substring(0, 27) + '...';
  } else {
    return inputString;
  }
}

export function formatText(text) {
  if (text?.includes('\n')) {
    const textWithHTMLLineBreaks = text?.replace(/\n/g, '<br />');

    // Split the text into lines
    const lines = textWithHTMLLineBreaks.split('<br />');

    // Replace lines starting with hyphen with bullet points and adjust line breaks
    const textWithBulletPoints = lines?.map((line) => {
      if (line?.trim().startsWith('-')) {
        return <div style={{ marginBottom: '6px', color: '#d1d5db' }}>&bull; {line?.trim()?.slice(1)}</div>;
      } else if (line?.includes(':')) {
        const [beforeColon, afterColon] = line.split(':');
        return (
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'white' }}>{beforeColon}:</strong> {afterColon}
          </div>
        );
      } else {
        return (
          <div>
            {line?.trim()}
            <br />
          </div>
        );
      }
    });

    return <div style={{ color: '#d1d5db' }}>{textWithBulletPoints}</div>;
  } else {
    return <div style={{ marginBottom: '6px', color: '#d1d5db' }}>{text}</div>;
  }
}

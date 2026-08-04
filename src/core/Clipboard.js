export default class Clipboard {
  async write(text) {
    const value = String(text ?? '');
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
    return this.fallbackWrite(value);
  }
  async read() {
    if (!navigator.clipboard?.readText)
      throw new Error('A leitura da área de transferência não é suportada.');
    return navigator.clipboard.readText();
  }
  fallbackWrite(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  }
}

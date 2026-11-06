export function sanitizeFragment(html) {
  const template = document.createElement("template");
  template.innerHTML = html;

  template.content.querySelectorAll("script").forEach((script) => script.remove());
  template.content.querySelectorAll("*").forEach((node) => {
    [...(node.attributes || [])].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value;
      if (name.startsWith("on")) node.removeAttribute(attr.name);
      if ((name === "href" || name === "src") && /^\s*javascript:/i.test(value)) {
        node.removeAttribute(attr.name);
      }
    });
  });

  return template.content.cloneNode(true);
}

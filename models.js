const categoryNav = document.getElementById("category-nav");
const categoryRoot = document.getElementById("model-categories");

const node = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
};

MODEL_CATEGORIES.forEach((category, index) => {
  const link = node("a", `${String(index+1).padStart(2,"0")} ${category.title}`);
  link.href = `#category-${category.id}`;
  categoryNav.append(link);

  const section = node("section", null, "category-section");
  section.id = `category-${category.id}`;
  const heading = node("div", null, "category-heading");
  const titleGroup = node("div");
  titleGroup.append(node("p", `CATEGORY ${String(index+1).padStart(2,"0")}`, "eyebrow"), node("h2", category.title), node("p", category.description, "category-description"));
  heading.append(titleGroup, node("span", `${category.models.length} MODEL FAMILIES`, "count-label"));
  section.append(heading);

  const grid = node("div", null, "model-grid");
  category.models.forEach((model) => {
    const card = node("article", null, "model-card");
    const top = node("div", null, "model-card-top");
    top.append(node("span", model.provider, "provider-label"), node("span", "OVERVIEW", "model-type"));
    card.append(top, node("h3", model.name), node("p", model.fit, "model-fit"), node("h4", "จุดเด่น"));
    const strengths = node("ul");
    model.strengths.forEach((strength) => strengths.append(node("li", strength)));
    card.append(strengths, node("h4", "ข้อควรพิจารณา"), node("p", model.caveat, "caveat"));
    const link = node("a", "เอกสารทางการ ↗", "official-link");
    link.href = model.url; link.target = "_blank"; link.rel = "noopener noreferrer";
    card.append(link);
    grid.append(card);
  });
  section.append(grid);
  categoryRoot.append(section);
});

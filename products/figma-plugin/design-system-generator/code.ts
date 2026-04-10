/**
 * Figma Plugin: Design System Generator
 * 小七团队开发
 * 功能: 自动生成设计规范 (颜色/字体/组件)
 */

// 显示UI
figma.showUI(__html__, { width: 400, height: 600 });

// 监听消息
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate-design-system') {
    await generateDesignSystem(msg.options);
  } else if (msg.type === 'export-styles') {
    await exportStyles();
  } else if (msg.type === 'create-components') {
    await createComponents();
  }
};

// 生成设计系统
async function generateDesignSystem(options: any) {
  const { colors, typography, spacing, shadows } = options;
  
  // 获取当前页面
  const page = figma.currentPage;
  
  // 创建设计系统页面
  const designSystemPage = figma.createPage();
  designSystemPage.name = '🎨 Design System';
  
  // 创建颜色样式
  if (colors) {
    await generateColorStyles(designSystemPage);
  }
  
  // 创建字体样式
  if (typography) {
    await generateTypographyStyles(designSystemPage);
  }
  
  // 创建间距系统
  if (spacing) {
    await generateSpacingSystem(designSystemPage);
  }
  
  // 创建阴影样式
  if (shadows) {
    await generateShadowStyles(designSystemPage);
  }
  
  // 创建组件库
  await createComponentLibrary(designSystemPage);
  
  // 切换到设计系统页面
  figma.currentPage = designSystemPage;
  
  figma.ui.postMessage({
    type: 'design-system-created',
    message: '设计系统生成完成！'
  });
}

// 生成颜色样式
async function generateColorStyles(page: PageNode) {
  const colors = [
    { name: 'Primary/500', color: { r: 0.23, g: 0.51, b: 0.96 } },
    { name: 'Primary/600', color: { r: 0.18, g: 0.42, b: 0.88 } },
    { name: 'Primary/400', color: { r: 0.42, g: 0.65, b: 0.98 } },
    { name: 'Secondary/500', color: { r: 0.55, g: 0.35, b: 0.96 } },
    { name: 'Success/500', color: { r: 0.22, g: 0.79, b: 0.45 } },
    { name: 'Warning/500', color: { r: 0.98, g: 0.73, b: 0.18 } },
    { name: 'Error/500', color: { r: 0.93, g: 0.26, b: 0.26 } },
    { name: 'Gray/900', color: { r: 0.11, g: 0.14, b: 0.18 } },
    { name: 'Gray/700', color: { r: 0.27, g: 0.31, b: 0.36 } },
    { name: 'Gray/500', color: { r: 0.44, g: 0.49, b: 0.55 } },
    { name: 'Gray/300', color: { r: 0.82, g: 0.84, b: 0.87 } },
    { name: 'Gray/100', color: { r: 0.95, g: 0.96, b: 0.96 } },
    { name: 'White', color: { r: 1, g: 1, b: 1 } },
    { name: 'Black', color: { r: 0, g: 0, b: 0 } },
  ];
  
  const startX = 0;
  const startY = 0;
  
  // 创建颜色标题
  const title = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  title.fontName = { family: "Inter", style: "Bold" };
  title.fontSize = 24;
  title.characters = "🎨 Colors";
  title.x = startX;
  title.y = startY;
  page.appendChild(title);
  
  // 创建颜色方块
  let currentY = startY + 60;
  let currentX = startX;
  
  for (let i = 0; i < colors.length; i++) {
    const color = colors[i];
    
    // 创建矩形
    const rect = figma.createRectangle();
    rect.name = color.name;
    rect.x = currentX;
    rect.y = currentY;
    rect.resize(80, 80);
    rect.fills = [{ type: 'SOLID', color: color.color }];
    rect.topLeftRadius = 8;
    rect.topRightRadius = 8;
    rect.bottomLeftRadius = 8;
    rect.bottomRightRadius = 8;
    page.appendChild(rect);
    
    // 创建标签
    const label = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    label.fontName = { family: "Inter", style: "Regular" };
    label.fontSize = 12;
    label.characters = color.name;
    label.x = currentX;
    label.y = currentY + 90;
    page.appendChild(label);
    
    // 移动到下一个位置
    currentX += 100;
    if (currentX > 700) {
      currentX = startX;
      currentY += 130;
    }
  }
  
  // 保存为样式
  for (const color of colors) {
    const paintStyle = figma.createPaintStyle();
    paintStyle.name = color.name;
    paintStyle.paints = [{ type: 'SOLID', color: color.color }];
  }
}

// 生成字体样式
async function generateTypographyStyles(page: PageNode) {
  const startX = 0;
  const startY = 400;
  
  // 标题
  const title = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  title.fontName = { family: "Inter", style: "Bold" };
  title.fontSize = 24;
  title.characters = "🔤 Typography";
  title.x = startX;
  title.y = startY;
  page.appendChild(title);
  
  // 字体层级
  const typography = [
    { name: 'Heading 1', size: 48, weight: 'Bold', lineHeight: 1.2 },
    { name: 'Heading 2', size: 36, weight: 'Bold', lineHeight: 1.2 },
    { name: 'Heading 3', size: 24, weight: 'SemiBold', lineHeight: 1.3 },
    { name: 'Heading 4', size: 20, weight: 'SemiBold', lineHeight: 1.4 },
    { name: 'Body Large', size: 18, weight: 'Regular', lineHeight: 1.6 },
    { name: 'Body', size: 16, weight: 'Regular', lineHeight: 1.6 },
    { name: 'Body Small', size: 14, weight: 'Regular', lineHeight: 1.5 },
    { name: 'Caption', size: 12, weight: 'Regular', lineHeight: 1.4 },
    { name: 'Button', size: 16, weight: 'SemiBold', lineHeight: 1.2 },
    { name: 'Label', size: 14, weight: 'Medium', lineHeight: 1.2 },
  ];
  
  let currentY = startY + 60;
  
  for (const type of typography) {
    const text = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: type.weight as any });
    text.fontName = { family: "Inter", style: type.weight as any };
    text.fontSize = type.size;
    text.lineHeight = { unit: 'PERCENT', value: type.lineHeight * 100 };
    text.characters = `${type.name} - The quick brown fox`;
    text.x = startX;
    text.y = currentY;
    page.appendChild(text);
    
    currentY += type.size * type.lineHeight + 20;
    
    // 保存为文本样式
    const textStyle = figma.createTextStyle();
    textStyle.name = type.name;
    textStyle.fontName = text.fontName;
    textStyle.fontSize = text.fontSize;
    textStyle.lineHeight = text.lineHeight;
  }
}

// 生成间距系统
async function generateSpacingSystem(page: PageNode) {
  const startX = 500;
  const startY = 400;
  
  const title = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  title.fontName = { family: "Inter", style: "Bold" };
  title.fontSize = 24;
  title.characters = "📏 Spacing";
  title.x = startX;
  title.y = startY;
  page.appendChild(title);
  
  const spacings = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];
  
  let currentY = startY + 60;
  
  for (const space of spacings) {
    // 方块
    const rect = figma.createRectangle();
    rect.name = `${space}px`;
    rect.x = startX;
    rect.y = currentY;
    rect.resize(space, space);
    rect.fills = [{ type: 'SOLID', color: { r: 0.23, g: 0.51, b: 0.96 } }];
    rect.topLeftRadius = 4;
    rect.topRightRadius = 4;
    rect.bottomLeftRadius = 4;
    rect.bottomRightRadius = 4;
    page.appendChild(rect);
    
    // 标签
    const label = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    label.fontName = { family: "Inter", style: "Regular" };
    label.fontSize = 14;
    label.characters = `${space}px`;
    label.x = startX + space + 16;
    label.y = currentY + (space - 14) / 2;
    page.appendChild(label);
    
    currentY += Math.max(space, 30) + 10;
  }
  
  // 创建效果样式
  for (const space of spacings) {
    const effectStyle = figma.createEffectStyle();
    effectStyle.name = `Spacing/${space}`;
    effectStyle.effects = [];
  }
}

// 生成阴影样式
async function generateShadowStyles(page: PageNode) {
  const startX = 900;
  const startY = 400;
  
  const title = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  title.fontName = { family: "Inter", style: "Bold" };
  title.fontSize = 24;
  title.characters = "☁️ Shadows";
  title.x = startX;
  title.y = startY;
  page.appendChild(title);
  
  const shadows = [
    { name: 'sm', x: 0, y: 1, blur: 2, spread: 0, opacity: 0.05 },
    { name: 'md', x: 0, y: 4, blur: 6, spread: -1, opacity: 0.1 },
    { name: 'lg', x: 0, y: 10, blur: 15, spread: -3, opacity: 0.1 },
    { name: 'xl', x: 0, y: 20, blur: 25, spread: -5, opacity: 0.1 },
    { name: '2xl', x: 0, y: 25, blur: 50, spread: -12, opacity: 0.25 },
  ];
  
  let currentY = startY + 60;
  
  for (const shadow of shadows) {
    const rect = figma.createRectangle();
    rect.name = `Shadow ${shadow.name}`;
    rect.x = startX;
    rect.y = currentY;
    rect.resize(120, 60);
    rect.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    rect.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
    rect.strokeWeight = 1;
    rect.topLeftRadius = 8;
    rect.topRightRadius = 8;
    rect.bottomLeftRadius = 8;
    rect.bottomRightRadius = 8;
    rect.effects = [{
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: shadow.opacity },
      offset: { x: shadow.x, y: shadow.y },
      radius: shadow.blur,
      spread: shadow.spread,
      visible: true,
      blendMode: 'NORMAL'
    }];
    page.appendChild(rect);
    
    const label = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    label.fontName = { family: "Inter", style: "Regular" };
    label.fontSize = 14;
    label.characters = shadow.name;
    label.x = startX + 140;
    label.y = currentY + 20;
    page.appendChild(label);
    
    currentY += 100;
    
    // 保存效果样式
    const effectStyle = figma.createEffectStyle();
    effectStyle.name = `Shadow/${shadow.name}`;
    effectStyle.effects = rect.effects;
  }
}

// 创建组件库
async function createComponentLibrary(page: PageNode) {
  const startX = 0;
  const startY = 1200;
  
  const title = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  title.fontName = { family: "Inter", style: "Bold" };
  title.fontSize = 24;
  title.characters = "🧩 Components";
  title.x = startX;
  title.y = startY;
  page.appendChild(title);
  
  // 按钮组件
  await createButtonComponent(page, startX, startY + 60);
  
  // 输入框组件
  await createInputComponent(page, startX + 200, startY + 60);
  
  // 卡片组件
  await createCardComponent(page, startX + 450, startY + 60);
}

// 按钮组件
async function createButtonComponent(page: PageNode, x: number, y: number) {
  const button = figma.createComponent();
  button.name = "Button/Primary";
  button.x = x;
  button.y = y;
  button.resize(120, 44);
  button.fills = [{ type: 'SOLID', color: { r: 0.23, g: 0.51, b: 0.96 } }];
  button.topLeftRadius = 8;
  button.topRightRadius = 8;
  button.bottomLeftRadius = 8;
  button.bottomRightRadius = 8;
  
  const label = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "SemiBold" });
  label.fontName = { family: "Inter", style: "SemiBold" };
  label.fontSize = 16;
  label.characters = "Button";
  label.x = x + 32;
  label.y = y + 12;
  label.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  
  button.appendChild(label);
  page.appendChild(button);
}

// 输入框组件
async function createInputComponent(page: PageNode, x: number, y: number) {
  const input = figma.createComponent();
  input.name = "Input/Default";
  input.x = x;
  input.y = y;
  input.resize(200, 44);
  input.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  input.strokes = [{ type: 'SOLID', color: { r: 0.82, g: 0.84, b: 0.87 } }];
  input.strokeWeight = 1;
  input.topLeftRadius = 8;
  input.topRightRadius = 8;
  input.bottomLeftRadius = 8;
  input.bottomRightRadius = 8;
  
  const placeholder = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  placeholder.fontName = { family: "Inter", style: "Regular" };
  placeholder.fontSize = 14;
  placeholder.characters = "Placeholder...";
  placeholder.x = x + 12;
  placeholder.y = y + 13;
  placeholder.fills = [{ type: 'SOLID', color: { r: 0.44, g: 0.49, b: 0.55 } }];
  
  input.appendChild(placeholder);
  page.appendChild(input);
}

// 卡片组件
async function createCardComponent(page: PageNode, x: number, y: number) {
  const card = figma.createComponent();
  card.name = "Card/Default";
  card.x = x;
  card.y = y;
  card.resize(280, 160);
  card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  card.topLeftRadius = 12;
  card.topRightRadius = 12;
  card.bottomLeftRadius = 12;
  card.bottomRightRadius = 12;
  card.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.1 },
    offset: { x: 0, y: 4 },
    radius: 6,
    spread: -1,
    visible: true,
    blendMode: 'NORMAL'
  }];
  
  // 卡片标题
  const title = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "SemiBold" });
  title.fontName = { family: "Inter", style: "SemiBold" };
  title.fontSize = 18;
  title.characters = "Card Title";
  title.x = x + 16;
  title.y = y + 16;
  title.fills = [{ type: 'SOLID', color: { r: 0.11, g: 0.14, b: 0.18 } }];
  
  // 卡片内容
  const content = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  content.fontName = { family: "Inter", style: "Regular" };
  content.fontSize = 14;
  content.characters = "Card content goes here...";
  content.x = x + 16;
  content.y = y + 50;
  content.fills = [{ type: 'SOLID', color: { r: 0.44, g: 0.49, b: 0.55 } }];
  
  card.appendChild(title);
  card.appendChild(content);
  page.appendChild(card);
}

// 导出样式
async function exportStyles() {
  const styles = {
    colors: [],
    typography: [],
    effects: []
  };
  
  // 收集所有本地样式
  const paintStyles = figma.getLocalPaintStyles();
  const textStyles = figma.getLocalTextStyles();
  const effectStyles = figma.getLocalEffectStyles();
  
  // 发送给UI
  figma.ui.postMessage({
    type: 'styles-exported',
    data: {
      colors: paintStyles.length,
      typography: textStyles.length,
      effects: effectStyles.length
    }
  });
}

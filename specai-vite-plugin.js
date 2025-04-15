import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";
import * as t from "@babel/types";

const traverse = _traverse.default;
const generate = _generate.default;

function componentSpecTree() {
  const cwd = process.cwd();
  const stats = {
    totalFiles: 0,
    processedFiles: 0,
    totalElements: 0,
  };
  return {
    name: "vite-plugin-spec-tree",
    enforce: "pre",
    async transform(code, id) {
      if (!/\.(jsx|tsx)$/.test(id) || id.includes("node_modules")) {
        return null;
      }

      try {
        const parserOptions = {
          sourceType: "module",
          plugins: ["jsx", "typescript"],
        };

        const ast = parse(code, parserOptions);

        const visited = new Set();

        // 2. 遍历 AST 修改 JSX
        traverse(ast, {
          JSXElement(path) {
            const openingElement = path.node.openingElement;

            if (visited.has(path.node)) {
              return;
            }

            // 仅处理大写开头的组件（自定义组件）
            if (
              t.isJSXIdentifier(openingElement.name) &&
              /^[A-Z]/.test(openingElement.name.name)
            ) {
              const componentName = openingElement.name.name;
              const lineNumber = openingElement.loc?.start.line || "unknown";

              console.log(`current is ${componentName}`);

              // 找到 data-dora-id
              let doraId = "";
              if (openingElement.attributes.length > 0) {
                const attr = openingElement.attributes.find(
                  (attr) => attr.name.name === "data-dora-id"
                );
                if (attr) {
                  doraId = attr.value.value;
                }
              }

              if (!doraId) {
                return;
              }

              // 生成 <specai-tag-start> 节点
              const debugStart = t.jsxElement(
                t.jsxOpeningElement(
                  t.jsxIdentifier("specai-tag-start"),
                  [
                    t.jsxAttribute(
                      t.jsxIdentifier("data-component-name"),
                      t.stringLiteral(componentName)
                    ),
                    t.jsxAttribute(
                      t.jsxIdentifier("data-dora-id"),
                      t.stringLiteral(String(doraId))
                    ),
                  ],
                  true // 自闭合
                ),
                null,
                [],
                true
              );

              // 生成 <specai-tag-end> 节点
              const debugEnd = t.jsxElement(
                t.jsxOpeningElement(
                  t.jsxIdentifier("specai-tag-end"),
                  [
                    t.jsxAttribute(
                      t.jsxIdentifier("data-component-name"),
                      t.stringLiteral(componentName)
                    ),
                    t.jsxAttribute(
                      t.jsxIdentifier("data-dora-id"),
                      t.stringLiteral(String(doraId))
                    ),
                  ],
                  true // 自闭合
                ),
                null,
                [],
                true
              );

              // 用 Fragment (<>) 包裹原有子节点 + 调试标签
              const fragment = t.jsxFragment(
                t.jsxOpeningFragment(),
                t.jsxClosingFragment(),
                [
                  debugStart, // <specai-tag-start>
                  path.node, // 原有子节点
                  debugEnd, // <specai-tag-end>
                ]
              );

              visited.add(path.node);
              // 替换当前节点为 Fragment
              path.replaceWith(fragment);
            }
          },
        });

        // 3. 生成修改后的代码
        return generate(ast).code;
      } catch (error) {
        console.error(`Error processing file ${id}:`, error);
        stats.processedFiles++;
        return null;
      }
    },
  };
}

export { componentSpecTree };

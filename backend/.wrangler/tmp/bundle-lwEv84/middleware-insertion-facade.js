				import worker, * as OTHER_EXPORTS from "/Users/tomhutman/OneDrive/Documents/2023/cloudflare/cf-durable-object-test/src/index.ts";
				import * as __MIDDLEWARE_0__ from "/Users/tomhutman/.config/yarn/global/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts";
				const envWrappers = [__MIDDLEWARE_0__.wrap].filter(Boolean);
				const facade = {
					...worker,
					envWrappers,
					middleware: [
						__MIDDLEWARE_0__.default,
            ...(worker.middleware ? worker.middleware : []),
					].filter(Boolean)
				}
				export * from "/Users/tomhutman/OneDrive/Documents/2023/cloudflare/cf-durable-object-test/src/index.ts";

				const maskDurableObjectDefinition = (cls) =>
					class extends cls {
						constructor(state, env) {
							let wrappedEnv = env
							for (const wrapFn of envWrappers) {
								wrappedEnv = wrapFn(wrappedEnv)
							}
							super(state, wrappedEnv);
						}
					};
				export const YDocument = maskDurableObjectDefinition(OTHER_EXPORTS.YDocument);

				export default facade;
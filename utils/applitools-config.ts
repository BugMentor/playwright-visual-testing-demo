import { Configuration, BatchInfo, BrowserType } from '@applitools/eyes-playwright';

export function getApplitoolsConfig(): Configuration {
    const config = new Configuration();
    // API Key
    config.setApiKey(process.env.APPLITOOLS_API_KEY!);
    // Configuración de la aplicación
    config.setAppName('BugMentor Visual Testing Demo');
    // Batch para agrupar tests
    const batch = new BatchInfo('Playwright + AI Visual Testing');
    batch.setId(process.env.APPLITOOLS_BATCH_ID);
    config.setBatch(batch);
    // Configuración de navegadores para cross-browser testing
    config.addBrowsers(
        { name: BrowserType.CHROME, width: 1024, height: 768 },
        { name: BrowserType.FIREFOX, width: 1024, height: 768 },
        { name: BrowserType.SAFARI, width: 1024, height: 768 },
        { name: BrowserType.EDGE_CHROMIUM, width: 1024, height: 768 }
    );
    // Configuraciones avanzadas
    config.setMatchLevel('Layout'); // Strict, Content, Layout
    config.setIgnoreDisplacements(true);
    config.setSaveNewTests(true);
    config.setSaveDiffs(true);

    return config;
}
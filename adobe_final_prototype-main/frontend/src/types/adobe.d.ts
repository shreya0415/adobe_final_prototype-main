
declare global {
  interface Window {
    AdobeDC: {
      View: new (config: {
        clientId: string;
        divId: string;
      }) => {
        previewFile: (
          filePromise: {
            content: { location: { url: string } };
            metaData: { fileName: string };
          },
          viewerConfig: {
            embedMode: string;
            showAnnotationTools?: boolean;
            showLeftHandPanel?: boolean;
            showDownloadPDF?: boolean;
            showPrintPDF?: boolean;
            enableFormFilling?: boolean;
          }
        ) => void;
      };
    };
  }
}

export {};

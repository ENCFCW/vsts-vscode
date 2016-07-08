/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { window } from "vscode";
import { BaseClient } from "./baseclient";
import { TelemetryEvents } from "../helpers/constants";
import { Strings } from "../helpers/strings";
import { Utils } from "../helpers/utils";
import { BaseQuickPickItem } from "../helpers/vscodeutils";
import { TelemetryService } from "../services/telemetry";

export class FeedbackClient extends BaseClient {

    constructor(telemetryService: TelemetryService) {
        super(telemetryService);
    }

    public SendFeedback(): void {
        let self = this;

        let choices: Array<BaseQuickPickItem> = [];
        choices.push({ label: Strings.SendASmile, description: undefined, id: TelemetryEvents.SendASmile });
        choices.push({ label: Strings.SendAFrown, description: undefined, id: TelemetryEvents.SendAFrown });

        window.showQuickPick(choices, { matchOnDescription: false, placeHolder: Strings.SendFeedback }).then(
            function (choice) {
                if (choice) {
                    window.showInputBox({ value: undefined, prompt: Strings.SendFeedbackPrompt, placeHolder: undefined, password: false }).then((value) => {
                        if (value === undefined) {
                            let disposable = window.setStatusBarMessage(Strings.NoFeedbackSent);
                            setInterval(() => disposable.dispose(), 1000 * 5);
                            return;
                        }

                        //User does not need to provide any feedback text
                        let providedEmail: string = "";
                        window.showInputBox({ value: undefined, prompt: Strings.SendEmailPrompt, placeHolder: undefined, password: false }).then((email) => {
                            if (email === undefined) {
                                let disposable = window.setStatusBarMessage(Strings.NoFeedbackSent);
                                setInterval(() => disposable.dispose(), 1000 * 5);
                                return;
                            }
                            if (email) {
                                providedEmail = email;
                            }
                            //This feedback will go no matter whether Application Insights is enabled or not.
                            self.ReportFeedback(choice.id, { "VSCode.Feedback.Comment" : value, "VSCode.Feedback.Email" : providedEmail} );

                            let disposable = window.setStatusBarMessage(Strings.ThanksForFeedback);
                            setInterval(() => disposable.dispose(), 1000 * 5);
                        });
                    });
                }
            },
            function (err) {
                self.ReportError(Utils.GetMessageForStatusCode(0, err.message, "Failed getting SendFeedback selection"));
            }
        );
    }
}
export default {
    async fetch(request, env) {

        // IDスクリーンネーム対応表
        const idScreenNameHash = JSON.parse(env.IDSCREENNAMEHASH);

        // シークレットキー確認
        if (request.headers.get('X-Misskey-Hook-Secret') !== env.SECRET) {
            console.log('wrong secret');
            return new Response('wrong secret');
        }

        // ペイロード確認
        const reqBody = await request.text();
        if (!reqBody) {
            console.log('no body');
            return new Response('no body');
        }

        const body = JSON.parse(reqBody);
        console.log(body);

        // 設定→メンションされたとき
        if (body.type === 'mention') {
            const noteUserHost = body.body.note.user.host ? body.body.note.user.host : env.HOST;

            const ok = await fetch(env.DISCORD, {
                body: JSON.stringify({
                    embeds: [
                        {
                            title: `${idScreenNameHash[body.userId]}がメンションされました`,
                            color: 0x5865f2,
                            url: `${body.body.note.uri}`,
                            fields: [
                                {
                                    name: "スクリーンネーム",
                                    value: `${body.body.note.user.name}`,
                                    inline: true,
                                }, {
                                    name: "ユーザ名",
                                    value: `@${body.body.note.user.username}@${noteUserHost}`,
                                    inline: true,
                                }, {
                                    name: "内容",
                                    value: `${body.body.note.text}`,
                                },
                            ],
                        },
                    ],
                }),
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }).then((res) => res.ok);

            return new Response(ok ? 'ok' : 'error');
        }

        // 設定→フォローされたとき
        if (body.type === 'followed') {
            const userHost = body.body.user.host ? body.body.user.host : env.HOST;
            const userIsbot = body.body.user.isBot ? 'はい' : 'いいえ';

            const ok = await fetch(env.DISCORD, {
                body: JSON.stringify({
                    embeds: [
                        {
                            title: `${idScreenNameHash[body.userId]}がフォローされました`,
                            color: 0x0fcfc2,
                            url: `${body.server}`,
                            fields: [
                                {
                                    name: "スクリーンネーム",
                                    value: `${body.body.user.name}`,
                                    inline: true,
                                }, {
                                    name: "ユーザ名",
                                    value: `@${body.body.user.username}@${userHost}`,
                                    inline: true,
                                }, {
                                    name: "ボット",
                                    value: `${userIsbot}`,
                                },
                            ],
                        },
                    ],
                }),
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }).then((res) => res.ok);

            return new Response(ok ? 'ok' : 'error');
        }

        // 設定→Renoteされたとき
        if (body.type === 'renote') {
            const noteUserHost = body.body.note.user.host ? body.body.note.user.host : env.HOST;

            const ok = await fetch(env.DISCORD, {
                body: JSON.stringify({
                    embeds: [
                        {
                            title: `${idScreenNameHash[body.userId]}がリノートされました`,
                            color: 0xc78c0d,
                            url: `${body.server}`,
                            fields: [
                                {
                                    name: "スクリーンネーム",
                                    value: `${body.body.note.user.name}`,
                                    inline: true,
                                }, {
                                    name: "ユーザ名",
                                    value: `@${body.body.note.user.username}@${noteUserHost}`,
                                    inline: true,
                                }, {
                                    name: "内容",
                                    value: `${body.body.note.renote.text}`,
                                },
                            ],
                        },
                    ],
                }),
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }).then((res) => res.ok);

            return new Response(ok ? 'ok' : 'error');
        }

        // コントロールパネル→ユーザーが作成されたとき
        if (body.type === 'userCreated') {
            const ok = await fetch(env.DISCORD, {
                body: JSON.stringify({
                    embeds: [
                        {
                            title: "新規ユーザが登録されました",
                            color: 0x57f287,
                            url: `${body.server}`,
                            fields: [
                                {
                                    name: "ユーザ名",
                                    value: `@${body.body.username}@${env.HOST}`,
                                    inline: true,
                                }, {
                                    name: "ユーザID",
                                    value: `${body.body.id}`,
                                    inline: true,
                                },
                            ],
                        },
                    ],
                }),
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }).then((res) => res.ok);

            return new Response(ok ? 'ok' : 'error');
        }

        // コントロールパネル→ユーザーから通報があったとき
        if (body.type === 'abuseReport') {
            const targetUserHost = body.body.targetUser.host ? body.body.targetUser.host : env.HOST;
            const reporterHost = body.body.reporter.host ? body.body.reporter.host : env.HOST;

            const ok = await fetch(env.DISCORD, {
                body: JSON.stringify({
                    embeds: [
                        {
                            title: "通報がありました",
                            color: 0xed4245,
                            url: `${body.server}`,
                            fields: [
                                {
                                    name: "被報告ユーザ名",
                                    value: `@${body.body.targetUser.username}@${targetUserHost}`,
                                    inline: true,
                                }, {
                                    name: "報告ユーザ名",
                                    value: `@${body.body.reporter.username}@${reporterHost}`,
                                    inline: true,
                                }, {
                                    name: "通報内容",
                                    value: `${body.body.comment}`,
                                }, {
                                    name: "被報告ユーザモデレーションノート",
                                    value: `${body.body.moderationNote}`,
                                },
                            ],
                        },
                    ],
                }),
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }).then((res) => res.ok);

            return new Response(ok ? 'ok' : 'error');
        }

        // コントロールパネル→ユーザーからの通報を処理したとき
        if (body.type === 'abuseReportResolved') {
            const targetUserHost = body.body.targetUser.host ? body.body.targetUser.host : env.HOST;
            const reporterHost = body.body.reporter.host ? body.body.reporter.host : env.HOST;
            const assigneeHost = body.body.assignee.host ? body.body.assignee.host : env.HOST;
            const resolved = body.body.resolved ? 'はい' : 'いいえ';
            const forwarded = body.body.forwarded ? 'はい' : 'いいえ';

            const ok = await fetch(env.DISCORD, {
                body: JSON.stringify({
                    embeds: [
                        {
                            title: "通報を処理しました",
                            color: 0x007fc9,
                            url: `${body.server}`,
                            fields: [
                                {
                                    name: "被報告ユーザ名",
                                    value: `@${body.body.targetUser.username}@${targetUserHost}`,
                                    inline: true,
                                }, {
                                    name: "報告ユーザ名",
                                    value: `@${body.body.reporter.username}@${reporterHost}`,
                                    inline: true,
                                }, {
                                    name: "解決ユーザ名",
                                    value: `@${body.body.assignee.username}@${assigneeHost}`,
                                    inline: true,
                                }, {
                                    name: "通報内容",
                                    value: `${body.body.comment}`,
                                }, {
                                    name: "被報告ユーザモデレーションノート",
                                    value: `${body.body.moderationNote}`,
                                }, {
                                    name: "解決済み",
                                    value: `${resolved}`,
                                }, {
                                    name: "転送済み",
                                    value: `${forwarded}`,
                                },
                            ],
                        },
                    ],
                }),
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }).then((res) => res.ok);

            return new Response(ok ? 'ok' : 'error');
        }

        // コントロールパネル→モデレーターが一定期間非アクティブになったとき
        if (body.type === 'inactiveModeratorsWarning') {
            const ok = await fetch(env.DISCORD, {
                body: JSON.stringify({
                    embeds: [
                        {
                            title: "モデレータが非アクティブになりました",
                            color: 0xd1ab00,
                            url: `${body.server}`,
                            fields: [
                                {
                                    name: "残り時間",
                                    value: `${body.body.remainingTime.asHours}`,
                                },
                            ],
                        },
                    ],
                }),
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }).then((res) => res.ok);

            return new Response(ok ? 'ok' : 'error');
        }

        // コントロールパネル→モデレーターが一定期間非アクティブだったため、システムにより招待制へと変更されたとき
        if (body.type === 'inactiveModeratorsInvitationOnlyChanged') {
            const ok = await fetch(env.DISCORD, {
                body: JSON.stringify({
                    embeds: [
                        {
                            title: "サーバが招待制に変更されました",
                            color: 0xbd0000,
                            url: `${body.server}`,
                        },
                    ],
                }),
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }).then((res) => res.ok);

            return new Response(ok ? 'ok' : 'error');
        }

        return new Response('error');
    },
};

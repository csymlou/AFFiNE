import { Switch } from '@affine/component';
import { EditorSettingService } from '@affine/core/modules/editor-setting';
import { useI18n } from '@affine/i18n';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback } from 'react';

import { SettingGroup } from '../group';
import { RowLayout } from '../row.layout';

export const EditorSettingGroup = () => {
  const t = useI18n();
  const editorSetting = useService(EditorSettingService).editorSetting;
  const displayBiDirectionalLink = useLiveData(
    editorSetting.settings$.selector(s => s.displayBiDirectionalLink)
  );

  const handleDisplayBiDirectionalLinkChange = useCallback(
    (checked: boolean) => {
      editorSetting.set('displayBiDirectionalLink', checked);
    },
    [editorSetting]
  );

  return (
    <SettingGroup title={t['com.affine.settings.editorSettings.title']()}>
      <RowLayout
        label={
          t[
            'com.affine.settings.editorSettings.page.display-bi-link.title'
          ]()
        }
      >
        <Switch
          data-testid="mobile-display-bi-link-trigger"
          checked={displayBiDirectionalLink}
          onChange={handleDisplayBiDirectionalLinkChange}
        />
      </RowLayout>
    </SettingGroup>
  );
};

import LolApiVersionStore from '../../store/modules/LolApi/VersionLolApiStore';

export default abstract class LolApiRepository {
    protected baseUrlWithoutVersion: string = 'http://ddragon.leagueoflegends.com/cdn';

    protected baseUrl: string = LolApiVersionStore.version ? `${this.baseUrlWithoutVersion}/${LolApiVersionStore.version}` : '';
}

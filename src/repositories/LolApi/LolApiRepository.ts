import LolApiVersionStore from '../../store/modules/LolApi/VersionLolApiStore';

export default abstract class LolApiRepository {
    protected baseUrl: string = LolApiVersionStore.version ? `http://ddragon.leagueoflegends.com/cdn/${LolApiVersionStore.version}` : '';
}

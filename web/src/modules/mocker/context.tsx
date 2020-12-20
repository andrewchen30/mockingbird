import { IMocker } from '../../interfaces/Mocker';
import createPaginationProvider from '../../utils/pagination';

const [providerComponent, paginationCtx] = createPaginationProvider<IMocker>();

export const mockerPagiCtx = paginationCtx;

export const MockerProvider = providerComponent;

export default mockerPagiCtx;
